
var axon = require('pm2-axon');
var sock = axon.socket('push');

// bind
sock.connect();

sock.on('pm2-app1:transfer', function(data) {
  console.log(data);
});
