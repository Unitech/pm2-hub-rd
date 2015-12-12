
var should      = require('should');
var clientOne   = new (require('..').client);
var clientTwo   = new (require('..').client);
var clientThree = new (require('..').client);
var node        = new (require('..').server);

var Plan = require('./helper/plan.js');

describe('Roundrobin test', function() {

  after(function(done) {
    node.close();
    clientOne.close();
    clientTwo.close();
    clientThree.close(done);
  });

  describe('Initialization', function() {
    it('should create node', function(done) {
      node.bind({
        strategy : 'roundrobin'
      },function(err, meta) {
        should(err).be.null;
        meta.port.should.eql(65100);
        meta.host.should.eql('localhost');
        meta.strategy.should.eql('roundrobin');
        done();
      });
    });

    it('should init clients', function(done) {
      clientOne.connect(function() {
        clientTwo.connect(function() {
          clientThree.connect(function() {
            done();
          });
        });
      });
    });
  });

  describe('Message party', function() {
    it('should receive message', function(done) {
      var plan = new Plan(4, done);

      var a = clientOne.on('datatype:one', function(data) {
        plan.ok(false);
      });

      var b = clientTwo.on('datatype:one', function(data) {
        plan.ok(true);
      });

      var c = clientThree.on('datatype:one', function(data) {
        plan.ok(true);
      });

      clientOne.emit('datatype:one', { data : true });
      clientOne.emit('datatype:one', { data : true });
      clientOne.emit('datatype:one', { data : true });
      clientOne.emit('datatype:one', { data : true });

    });
  });



});
