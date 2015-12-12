
var axon = require('pm2-axon');
var sock = axon.socket('pub');

sock.bind(3000);

sock.on('connect', function(handler, dt2) {
  //console.log(handler.send);

  var buf = sock.pack(['dt:dat', 'ayay']);
  handler.write(buf);
});


console.log('pub server started');

setInterval(function(){
  sock.send('dt:dat', 'hello');
}, 500);


var client = axon.socket('sub');

client.connect(3000);

client.on('message', function(msg){
  console.log('client1', msg.toString());
});

var client2 = axon.socket('sub');

client2.connect(3000);
client2.subscribe('dt:dat');

client2.on('message', function(msg){
  console.log('client2', msg.toString());
});
