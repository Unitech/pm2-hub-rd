var CarfClient,
    CarfServer = require('..').server,
    client = new require('..').client,
    server = new CarfServer,
    addr = {
        host: process.env.CARF_HOST || 'localhost',
        port: process.env.CARF_PORT || 3000
    },
    strategy = process.env.CARF_STRATEGY || 'all';


var should = require('should');
var assert = require('assert');

server.bind(undefined, function (err) {
    should.exist(err);
});

server.bind(addr, function (err) {
    should.not.exist(err);
});

server.close();
