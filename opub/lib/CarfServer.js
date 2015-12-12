var net = require("net"),
    util = require("util"),
    dumb = function () {},
    debug = require('debug')('server');
    CarfClient = require("./CarfClient");

function createUidGenerator() {

  var currentTimestamp = Date.now(),
      counter = 0;

  return function generateUid() {
    var timestamp = Date.now();

    if (timestamp == currentTimestamp) {
      counter++;
    } else {
      currentTimestamp = timestamp;
      counter = 0;
    }

    return '_' + timestamp + '-' + counter + '-' + Math.random().toString().slice(2);
  };

}

function send(message) {
  this.write(JSON.stringify(message) + '\r\n');
}

var connectHandler = function (socket) {
  var self = this,
      UID = this._generateUID();

  socket.UID = UID;
  socket.send = send;

  debug('New client connected UID %s', UID);

  socket.on('data', function(data) {

    data.toString().trim().split('\r\n').forEach(function (rawData) {
      var message = JSON.parse(rawData);

      debug('type= %s data=%o', message.wildcard, message);
      self.emit('_action:' + message.action, {
        socket: socket,
        message: message
      });
    });
  });

  socket.on('close', function () {
    delete self._sockets[UID];
  });

  socket.send({ "connected": "true" });
};

var CarfServer = function() {
  this._sockets          = {};
  this._buffered_message = [];
  this._initActionHandlers();
  this._generateUID      = createUidGenerator();
  this._uid              = this._generateUID();

  this.on('connection', connectHandler.bind(this));
};

util.inherits(CarfServer, net.Server);

CarfServer.prototype._sockets = null;

CarfServer.prototype._server = null;

CarfServer.prototype._generateUID = null;

var roundrobin = require('./rr.js');

// CarfServer.prototype._startRebuff = function() {
//   var self = this;

//   if (this._rebufInterval) return false;

//   this._rebufInterval = setInterval(function() {
//     if (self._buffered_message.length > 0) {

//     }
//   }, 1000);
// };

CarfServer.prototype._broadcastStrategyHandlers = {

  // TODO:
  // broadcast strategy to send only to sockets
  // with proper wildcard -- to reduce network
  // load.
  // Actually this must be a startup configurable param

  /**
   * Send to each client excluding sender in round robin
   */
  roundrobin : function(message, sender) {
    var self  = this;
    var socks = Object.keys(this._sockets);

    socks.splice(socks.indexOf(sender.UID), 1);

    if (typeof(this.curr_rr) == 'undefined')
      this.curr_rr = 0;

    if (socks.length < (this.curr_rr + 1))
      this.curr_rr = 0;

    debug('From %s to %s', sender.UID, socks[this.curr_rr]);
    self._sockets[socks[this.curr_rr]].send(message);

    this.curr_rr++;
  },

  /**
   * Send only to applications that has registered to the event
   */
  smartround : function(message, sender) {
    var self      = this;
    var tmp_socks = Object.keys(this._sockets);
    var socks     = [];

    // Select only sockets that has subscribed to event
    tmp_socks.forEach(function(sock) {
      if (self._sockets[sock]._subscribed_event.indexOf(message.wildcard) > -1)
        socks.push(sock);
    });

    // Remove sender socket
    if (socks.indexOf(sender.UID) > -1)
      socks.splice(socks.indexOf(sender.UID), 1);

    if (socks.length == 0) {
      /**
       * TODO: replay buffered messages
       */
      self._buffered_message.push({
        message : message,
        sender  : sender
      });
      return console.log('No receiver available, caching message');
    }

    self._sockets[socks[Math.floor(Math.random() * socks.length)]].send(message);
  },

  /**
   * Send event to everyone (including sender)
   */
  all: function (message, sender) {
    for( var UID in this._sockets) {
      this._sockets[UID].send(message);
    }
  },
  /**
   * Send event to everyone (excluding sender)
   */
  once: function (message, sender) {
    for (var UID in this._sockets) {
      if (UID == sender.UID) continue;
      this._sockets[UID].send(message);
      return;
    }
  }
};

CarfServer.prototype._actionHandlers = {

  subscribe : function(event) {
    // event.message
    // event.socket
    event.socket._subscribed_event.push(event.message.wildcard);
  },

  unsubscribe : function(event) {
    event.socket._subscribed_event.splice(event.socket._subscribed_event.indexOf(event.message.wildcard), 1);
  },

  connect: function (event) {
    if (this._uid == event.message.uid) return;
    this.subscribe(event.socket);
  },

  data: function (event) {
    if (this._uid == event.message.uid) return;

    this.publish({
      wildcard: event.message.wildcard,
      data: event.message.data
    }, event.socket);
  }

};

CarfServer.prototype.bind = function(options, cb) {

  if (typeof(options) == 'function') {
    cb = options;
    options = null;
  }

  cb = cb ? cb : dumb;

  if (!options) options = {};

  if (!options.port)
    options.port = 65100;

  if (!options.host)
    options.host = 'localhost';

  if (!options.strategy)
    options.strategy = 'all';

  this._port = options.port;
  this._nodes = [];

  var self = this,
      nodeAddresses = options.nodes || [];

  // nodeAddresses.forEach(function (addr, index) {

  //   var nodeClient = new CarfClient;

  //   nodeClient.connect(addr);
  //   self._nodes.push(nodeClient);

  // });

  this.on('close',function () {
    self._nodes.forEach(function (node) {
      node.close();
    });
  });

  this.on('error', function (err) {
    console.log( err );
  });

  var isKnownStrategy = options.strategy in this._broadcastStrategyHandlers,
      strategyHandler = isKnownStrategy ? options.strategy :  'all';

  this._strategy = this._broadcastStrategyHandlers[strategyHandler].bind(this);

  this.listen(this._port, undefined, undefined, function(err) {
    if (err) return cb(err);
    return cb(null, options);
  });
};

CarfServer.prototype._initActionHandlers = function () {
  for (var actionHandler in this._actionHandlers) {
    this.on('_action:' + actionHandler, this._actionHandlers[actionHandler].bind(this));
  }
};

CarfServer.prototype.subscribe = function (socket) {
  this._sockets[socket.UID] = socket;
  this._sockets[socket.UID]._subscribed_event = [];
  return socket;
};

CarfServer.prototype.publish = function (message, sender) {
  var uid = this._uid;

  // Emit to itself
  //this.emit(message.wildcard, message.data, uid);

  // Then emit to all nodes
  // this._nodes.forEach(function (node) {
  //   debug('Emiting %s', message.wildcard);
  //   node.emit(message.wildcard, message.data, uid);
  // });

  this._strategy(message, sender);
};


module.exports = CarfServer;
