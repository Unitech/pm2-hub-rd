
var should         = require('should');
var clientEmiter   = new (require('..').client);
var clientReceiver = new (require('..').client);
var node           = new (require('..').server);

/**
 * Strategies:
 * - all  : broadcast to everyone including sender
 * - once : broadcast to everyone excluding sender
 */
describe('Connect', function() {

  before(function(done) {
    node.bind({
      strategy : 'all'
    },function(err, meta) {
      should(err).be.null;
      meta.port.should.eql(65100);
      meta.host.should.eql('localhost');
      meta.strategy.should.eql('all');
      done();
    });
  });

  after(function(done) {
    node.close(function() {
      clientReceiver.close(function() {
        clientEmiter.close(done);
      });
    });
  });

  describe('Init connections', function() {
    it('should client1 connect to node', function(done) {
      clientEmiter.connect(function(err, meta) {
        should(err).be.null;
        meta.port.should.eql(65100);
        meta.host.should.eql('localhost');
        done();
      });
    });

    it('should client2 connect to node', function(done) {
      clientReceiver.connect(done);
    });
  });

  describe('Simple message broadcasting', function() {
    it('should client send data and server receive it', function(done) {
      var a = clientReceiver.on('datatype:one', function() {
        a();
        done();
      });

      clientEmiter.emit('datatype:one', {
        a : 'b'
      });
    });

    it('should call emit again but not trigger previous eventemitter', function(done) {
      clientEmiter.emit('datatype:one', {
        a : 'b'
      });

      done();
    });
  });

  describe('Regexp message broadcasting', function() {
    it('should client send data and server receive it', function(done) {
      var a = clientReceiver.on('datatype:*', function(data) {
        a();
        should(data.a).equal('b');
        done();
      });

      clientEmiter.emit('datatype:one', {
        a : 'b'
      });
    });

    it('should client send data and server receive it', function(done) {
      var a = clientReceiver.on('*', function(data) {
        a();
        should(data.a).equal('b');
        done();
      });

      clientEmiter.emit('datatype:one', {
        a : 'b'
      });
    });

  });

});
