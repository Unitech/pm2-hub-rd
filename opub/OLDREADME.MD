Description & Interface
==============

[Server]

Significant Methods:

```
_publish(wildcard, data, type)
_subscribe(wildcard, socket)
bind( port, nodes)
```
Type defines whether to send the message to all listeners or only to one.
Inherits net.Server.

Usage:
```
var CarfServer = require('./CarfServer'),
    port = process.env.CARF_PORT || process.argv[2] || 3000,
    server = new CarfServer();

server.listen(port);
```

```
node server.js [port] // or
CARF_PORT=3000 node server.js // CLI argument has higher priority
```

[Client]

Significant Methods:

```
connect(address, cb)
emit(wildcard, data)
on(wildcard, cb)
```

Usage:
```
var CarfClient = require("./CarfClient"),
    sock = new CarfClient(),
    addr = {
        host: process.env.CURF_HOST || 'localhost',
        port: process.env.CURF_PORT || 3000
    };

sock.connect(addr,function () {
    console.log( 'connected.' );
});

sock.on('.*', function(){
    console.log( arguments );
});

```
