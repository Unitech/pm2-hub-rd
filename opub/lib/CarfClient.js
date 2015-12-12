var util = require("util"),
    debug = require('debug')('client'),
    dumb = function () {};

var SimpleRegExp = function (regexpString) {
  this.regexp = regexpString;
};

SimpleRegExp.prototype.test = function (obj) {
  var string = obj + '',
      i = 0, ri;

  while(i < string.length) {
    ri = this.regexp[i] || null;

    if(ri != string[i]) {
      return (ri == '*') ? true : false;
    }

    ++i;
  }

  return true;
};

var Message = function () {
};

Message.prototype.action= null;

Message.prototype.toString = function () {
  return JSON.stringify(this);
};

var ConnectMessage = function (uid) {
  this.action = 'connect';
  this.uid = uid || null;
};

util.inherits(ConnectMessage, Message);

function parseData(data) {

  try {
    var s = JSON.stringify(data);
    var o = JSON.parse(s);

    if (o && typeof o === "object" && o !== null) {
      return s;
    } else {
      return o;
    }
  } catch (e) { return data.toString(); }

};
function maybeJson(jsonStr) {

  try {
    var o = JSON.parse(jsonStr);

    if (o && typeof o === "object" && o !== null) {
      return o;
    } else {
      return o;
    }
  } catch (e) { return jsonStr; }

};

var DataMessage = function (wildcard, data, uid) {

  this.action = 'data';

  this.wildcard = wildcard;

  this.data = parseData(data);

  this.uid = uid || null;

};

util.inherits(DataMessage, Message);

var CarfClient = function () {

  this._wildcardHandlers = [];
  this._quit = false;
};

CarfClient.prototype._client = null;

CarfClient.prototype._wildcardHandlers = null;

//@todo send unsubscribe
CarfClient.prototype.close = function (cb) {

  this._quit = true;
  try {
    this._client.destroy();
  } catch (e) {
    console.log( e );
  }
  return cb ? cb() : false;
};

CarfClient.prototype.connect = function (addr, cb) {

  if (typeof(addr) == 'function') {
    cb = addr;
    addr = null;
  }

  cb = cb ? cb : dumb;

  var self = this;

  if (!addr) {
    addr = {
      port : 65100,
      host : 'localhost'
    };
  }

  this._client = require("net");
  this._client = this._client.connect(addr, function(err) {
    if (err) return cb(err);
    return cb(null, addr);
  });

  this._client.on('data', function (data) {

    data.toString().trim().split('\r\n').forEach(function (rawData) {

      var message = JSON.parse(rawData);

      self._wildcardHandlers.forEach(function (handler) {
        if (handler.wildcard.test(message.wildcard)) {
          handler.callback(maybeJson(message.data), message.wildcard);
        }
      });
    });
  });

  /**
   * Reconnect strategy
   */
  this._client.on('close', function(){
    // console.log( addr );

    if (self._quit) return;

    setTimeout(function () {
      debug('Reconnecting');
      self.connect(addr,cb);
    }, 400);

  });

  this._client.on('error', function(err){
    console.log( err );

  });

  var connect = new ConnectMessage;
  this._send(connect);
};

CarfClient.prototype.emit = function (wildcard, data, clientId) {

  var message = new DataMessage(wildcard, data, clientId);

  this._send(message);

};
CarfClient.prototype._send = function (message) {
  //FIXME: code dup
  this._client.write(JSON.stringify(message) + '\r\n');
};
CarfClient.prototype.on = function (wildcard, cb) {

  /**
   * When listening to a event, subscribe
   */
  this._send({
    action   : 'subscribe',
    wildcard : wildcard
  });
  this._wildcardHandlers.push({

    // TODO:
    // Proper wildcard binding.
    // RegExp's are too slow and monstrous
    // for such routing.

    wildcard: new SimpleRegExp(wildcard),
    callback: cb.bind(this)
  });

  var self = this;

  /**
   * Angular style
   * on return a function that when is called, unbind the event
   */
  return function() {
    self._send({
      action   : 'unsubscribe',
      wildcard : wildcard
    });

    self._wildcardHandlers.forEach(function(data, index) {
      if (data.wildcard.regexp == new SimpleRegExp(wildcard).regexp &&
          JSON.stringify(data.callback) == JSON.stringify(cb)) {
        self._wildcardHandlers.splice(index, 1);
      }
    });
  };
};

// CarfClient.prototype.removeListener = function (wildcard, cb) {
//   var self = this;


//   this._wildcardHandlers.push({

//     // TODO:
//     // Proper wildcard binding.
//     // RegExp's are too slow and monstrous
//     // for such routing.

//     wildcard: new SimpleRegExp(wildcard),
//     callback: cb.bind(this)
//   });
// };

module.exports = CarfClient;
