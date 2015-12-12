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

var n = 0;




client.on('wildcard:*', function (e) {

    switch(e.wildcard) {
    case 'wildcard:foo': e.data.should.eql('bar');break;
    case 'wildcard:cat': e.data.should.eql('dog');break;
    case 'wildcard:hand:leg': e.data.should.eql('body');break;
    case 'wildcard:k:e:y': e.data.should.eql('board');break;
    }

    if (++n == 6) {
        client.close();
        server.close();
    }
});

client.on('string:test', function (e) {
    e.data.should.eql('test');

    if (++n == 6) {
        client.close();
        server.close();
    }

});
client.on('simple', function (e) {
    e.data.should.eql('message');

    if (++n == 6) {
        client.close();
        server.close();
    }

});


server.bind(addr, function() {

    client.connect(addr);
    client.emit('wildcard:foo', 'bar');
    client.emit('wildcard:cat', 'dog');
    client.emit('wildcard:hand:leg', 'body');
    client.emit('wildcard:k:e:y', 'board');
    client.emit('string:test', 'test');
    client.emit('simple', 'message');

});
