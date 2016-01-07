'use strict';
const Promise = require('bluebird');
const stream = require('stream');
const util = require('util');


function StringReadStream (string, opts_) {
  stream.Readable.call(this);

  this.index = 0;
  this.string = string;
  this.options = opts_ || {};

  this.options.chunkSize = (this.options.chunkSize === undefined) ? 1000 :
    parseInt(this.options.chunkSize) || this.string.length;

  if (this.options.chunkSize < 0) {
    throw new RangeError('chunkSize must be non-negative: ' + this.options.chunkSize);
  }
}

StringReadStream.prototype._read = function _read (size) {
  var readSize = this.options.chunkSize;
  var keepReading = true;
  while (keepReading && this.index < this.string.length) {
    keepReading = this.push(this.string.substring(this.index, this.index + readSize));
    this.index += readSize
  }
  if (this.index >= this.string.length) {
    this.push(null);
  }
}

util.inherits(StringReadStream, stream.Readable);


exports.readString = function readString (string, opts_) {
  return new StringReadStream(string, opts_);
}


exports.writeString = function writeString (stream, opts_) {
  var options = opts_ || {};

  return new Promise(function (accept, reject) {
    var gathered = [];

    var _onData = function (chunk) {
      gathered.push(chunk.toString());
    };
    var _onEnd = function () {
      _finally();
      accept(gathered.join(''));
    };
    var _onError = function (error) {
      _finally();
      reject(error);
    };

    var _finally = function () {
      stream.removeListener('data', _onData);
      stream.removeListener('end', _onEnd);
      stream.removeListener('error', _onError);
    }

    stream.on('error', _onError);
    stream.on('end', _onEnd);
    stream.on('data', _onData);
  });
}
