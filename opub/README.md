
# PUB SUB system for Microservice applications

## PUB SUB node

```javascript
var node = new (require('..').server);

node.bind({
  strategy : 'once',
  host     : 'localhost',
  port     : 65100
}, function(err, meta) {
  // meta.port
  // meta.host
  // meta.strategy
});
```

## PUB SUB client

```javascript
var clientOne = new (require('..').client);
var clientTwo = new (require('..').client);

clientOne.connect({
  host     : 'localhost',
  port     : 65100
}, function(err, meta) {
  // meta.port
  // meta.host
});

clientTwo.connect({
  host     : 'localhost',
  port     : 65100
}, function(err, meta) {
  // meta.port
  // meta.host
});

clientTwo.on('*', function(data, event) {
  // Data received
});

clientOne.emit('datatype:one', { data : 'emitted'} );
```

## Broadcast Strategies (for central node)

- roundrobin: send emitted event to each client in roundrobin way (excluding sender)
- smartround: send emitted event to each client subscribed to target event in random way (excluding sender)
- all: broadcast emitted event to all clients connected
- once: broadcast emitted event to all clients connected (excluding sender)


## Unbind

Angular style

```
var client = clientTwo.on('*', function(data, event) {
  // Data received
});

// Unbind
client();
```

## Roadmap

- Queue events if no consumer connected
- Verify that event is sent to consumer subscribed (done smartround)

## LICENSE

MIT
