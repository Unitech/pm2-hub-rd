var CarfClient =  require('..').client,
    CarfServer = require('..').server,
    client = new CarfClient,
    server = new CarfServer,
    addr = {
        host: process.env.CARF_HOST || 'localhost',
        port: process.env.CARF_PORT || 3000
    },
    strategy = process.env.CARF_STRATEGY || 'all';


var should = require('should');
var assert = require('assert');

// arg type checks

var n = 0;

server.bind(addr);
client.connect(addr);

client.emit('a', 'foo');
client.emit('b', { bar: 'baz' });

client.on('a', function(a){

    assert('string' == typeof a.data);
    a.data.should.eql('foo');
    ++n;

    if (n == 2) {
        server.close();
        client.close();
    }

});

client.on('b', function(b){

    b.data.should.eql({ bar: "baz" });
    ++n;

    if (n == 2) {
        server.close();
        client.close();
    }

});

process.on('exit', function(){
    n.should.eql(2);
});
