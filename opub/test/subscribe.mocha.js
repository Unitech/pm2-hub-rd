

var should      = require('should');
var clientOne   = new (require('..').client);
var clientTwo   = new (require('..').client);
var clientThree = new (require('..').client);
var node        = new (require('..').server);

var Plan = require('./helper/plan.js');

describe('Smart Robin test', function() {

  after(function(done) {
    node.close();
    clientOne.close();
    clientTwo.close();
    clientThree.close(done);
  });

  describe('Initialization', function() {
    it('should create node', function(done) {
      node.bind({
        strategy : 'smartround'
      },function(err, meta) {
        should(err).be.null;
        meta.port.should.eql(65100);
        meta.host.should.eql('localhost');
        meta.strategy.should.eql('smartround');
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

  describe('Check subscription', function() {
    it('should only client registered to event receive message', function(done) {
      var plan = new Plan(3, function() {
        a();
        b();
        c();
        d();
        done();
      });

      var a = clientOne.on('datatype:two', function(data) {
        plan.ok(false);
      });

      var b = clientOne.on('datatype:one', function(data) {
        plan.ok(false);
      });

      var d = clientThree.on('datatype:two', function(data) {
        plan.ok(false);
      });

      var c = clientTwo.on('datatype:one', function(data) {
        plan.ok(true);
      });

      setTimeout(function() {
        clientOne.emit('datatype:one', { data : true });
        clientOne.emit('datatype:one', { data : true });
        clientOne.emit('datatype:one', { data : true });
      }, 100);
    });

  });



});
