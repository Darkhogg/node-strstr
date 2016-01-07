'use strict';
const chai = require('chai');
const Promise = require('bluebird');
const stream = require('stream');

const ss = require('..');

const assert = chai.assert;
const expect = chai.expect;

describe('ss.readString', function () {

  it('should eventually emit the passed string', function (done) {
    var string = 'some random string that\'s goind to be emitted';
    var stream = ss.readString(string);
    var readString = '';
    stream.on('data', function (chunk) {
      readString += chunk;
    });
    stream.on('end', function () {
      expect(readString).to.equal(string);
      done();
    });
    stream.on('close', function () {
      assert.fail();
    });
    stream.on('error', function (err) {
      assert.fail(err);
    });
  });

  it('should not emit anything for an empty string by default', function (done) {
    var stream = ss.readString('');
    stream.on('data', function () {
      assert.fail();
    });
    stream.on('close', function () {
      assert.fail();
    });
    stream.on('error', function (err) {
      assert.fail(err);
    });
    stream.on('end', function () {
      done();
    });
  });

  context('options.chunkSize', function () {
    var bigString;

    before(function () {
      bigString = '';
      for (var i = 0; i < 1000; i++) {
        bigString += 'some characters in a single line\n';
      }
    });

    it('should obey the chunkSize if it has a positive value', function (done) {
      var chunkSize = 255;
      var stream = ss.readString(bigString, {'chunkSize': chunkSize});
      stream.on('data', function (chunk) {
        expect(chunk).to.have.length.at.most(chunkSize);
      });
      stream.on('close', function () {
        assert.fail();
      });
      stream.on('error', function (err) {
        assert.fail(err);
      });
      stream.on('end', function () {
        done();
      });
    });

    it('should emit all the string at once if its value is zero', function (done) {
      var stream = ss.readString(bigString, {'chunkSize': 0});
      stream.once('data', function (chunk) {
        expect(chunk).to.have.length(bigString.length);
        stream.on('data', function () {
          assert.fail();
        });
      });
      stream.on('close', function () {
        assert.fail();
      });
      stream.on('error', function (err) {
        assert.fail(err);
      });
      stream.on('end', function () {
        done();
      });
    });

    it('should not accept a negative value', function () {
      expect(function () {
        ss.readString('', {'chunkSize': -1});
      }).to.throw(RangeError, /non-negative/);
    });
  });
});

describe('ss.writeString', function () {
  var r;

  beforeEach(function () {
    r = stream.Readable();
    r._read = function(){};
  })

  it('should correctly accumulate a stream', function () {
    r.push('this');
    r.push(' is');
    r.push(' the ');
    r.push('full str');
    r.push('ing');
    r.push(null);

    return ss.writeString(r).then(function (result) {
      expect(result).to.equal('this is the full string');
    });
  });

  it('should return an empty string if no data is emitted', function () {
    r.push(null);

    return ss.writeString(r).then(function (result) {
      expect(result).to.equal('');
    });
  });

  it('should reject the returned promise if the stream emits an error', function (done) {
    ss.writeString(r).then(function (result) {
      assert.fail();
    }).catch(function () {
      done();
    });

    r.emit('error', new Error());
  });

});
