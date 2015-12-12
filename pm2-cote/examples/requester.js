var Cote  = require('../cote/index.js');

var randomRequest = new Cote.Requester({
  name: 'randomReq',
  // namespace: 'rnd',
  requests: ['randomRequestsadsad']
});

randomRequest.on('ready', function() {
  setInterval(function() {
    randomRequest.send({
      type: 'randomRequest',
      val: ~~(Math.random() * 10)
    }, function(res) {
      console.log('answer', res);
    });
  }, 5000);
});

// Instantiate a new Responder component.
var randomResponder = new Cote.Responder({
  name: 'randomRep',
  // namespace: 'rnd',
  respondsTo: ['raasdsadndomRequest'] // types of requests this responder
  // can respond to.
});

// request handlers are like any event handler.
randomResponder.on('randomRequest', function(req, cb) {
  var answer = ~~(Math.random() * 10);
  console.log('request', req.val, 'answering with', answer);
  cb(answer);
});
