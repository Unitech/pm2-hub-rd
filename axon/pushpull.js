var axon = require('pm2-axon');
var sock = axon.socket('push');

sock.bind(3012);
console.log('push server started');

setInterval(function(){
  sock.send('hello');
}, 1000);

var client  = axon.socket('pull');
var client2 = axon.socket('pull');
var client3 = axon.socket('pull');

client.connect(3012);

client.on('message', function(msg){
  console.log('client1', msg.toString());
});

client2.connect(3012);

client2.on('message', function(msg){
  console.log('client2', msg.toString());
});

client3.connect(3012);

client3.on('message', function(msg){
  console.log('client3', msg.toString());
});
