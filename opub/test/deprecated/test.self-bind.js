var CarfClient =  require('..').client,
    CarfServer = require('..').server,
    client = new CarfClient,
    sender = new CarfClient,
    server = new CarfServer,
    server2 = new CarfServer,
    server3 = new CarfServer,
    addr = {
        host: process.env.CARF_HOST || 'localhost',
        port: process.env.CARF_PORT || 3000
    },
    strategy = process.env.CARF_STRATEGY || 'all';


var should = require('should');
var assert = require('assert');

server.bind(addr);
server.bind({
    port: addr.port,
    nodes: [addr, addr]
});
server2.bind({
    port: addr.port+1,
    nodes: [ { host: addr.host, port: addr.port+10 }]
});
server3.bind({
    port: addr.port+10,
    nodes: [addr]

});

sender.connect({ host: 'localhost', port: addr.port+1 });
client.connect(addr);


client.on('foo', function (e) {

    e.data.should.eql('bar');

    server.close();
    server2.close();
    server3.close();
    client.close();
    sender.close();


});


sender.emit('foo', 'bar');
