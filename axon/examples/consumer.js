
var axon = require('pm2-axon');
var sock = axon.socket('push');

sock.connect();

sock.emit('pm2-app1:transfer', {
  data : true
});
