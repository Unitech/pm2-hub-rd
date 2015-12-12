
var axon = require('pm2-axon');
var sock = axon.socket('req');

sock.bind(3000);

var dt = {
  a : 'b'
};

setInterval(function() {
  sock.send(dt, function(res){
    console.log(res);
  });
}, 1000);

var client  = axon.socket('rep');
var client2 = axon.socket('rep');
var client3 = axon.socket('rep');

client.connect(3000);

client.on('message', function(img, reply){
  console.log('client1');
  // resize the image
  reply(img);
});

client2.connect(3000);

client2.on('message', function(img, reply){
  console.log('client2');
  // resize the image
  reply(img);
});

client3.connect(3000);

client3.on('message', function(img, reply){
  console.log('client3');
  // resize the image
  reply(img);
});
