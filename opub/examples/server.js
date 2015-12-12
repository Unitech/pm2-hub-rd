var CarfServer = require('../lib/CarfServer');

var addr = {
  host: process.env.CARF_HOST || 'localhost',
  port: process.env.CARF_PORT || 3000
};

var strategy = process.env.CARF_STRATEGY || 'all';
var server = new CarfServer;

server.bind({
  port: addr.port,
  nodes: [
    { host: 'localhost', port: 3000 }
  ],
  strategy: strategy
});
