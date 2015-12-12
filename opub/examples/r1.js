var CarfClient =  require('../lib/CarfClient');

var sock = new CarfClient;

var addr = {
  host: process.env.CARF_HOST || 'localhost',
  port: process.env.CARF_PORT || 3000
};

sock.connect(addr);

sock.on('hello:*', function(packet){
  console.log(packet.data);
});
