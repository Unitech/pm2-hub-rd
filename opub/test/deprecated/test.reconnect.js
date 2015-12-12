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

server.bind(addr);
client.connect(addr);

var message = 'before',
    afterClosed = false;

client.on('message', function (e) {
    e.data.should.eql(message);
    server.close();

    if (afterClosed) {
        client.close();
    } else {

        setTimeout(function () {

            server.bind(addr);
            afterClosed = true;

            setTimeout(function () {
                message = 'after';
                client.emit('message', message);
            }, 130);

        },30);

    }
});

client.emit('message', message);
