StringStream
============

`string-stream` is a small Node.js library that provides a way of both reading a string as a Node
stream and to gather all data from a Node stream and return a string from it.

Why?
----


Usage
-----

```javascript
var ss = require('string-stream');

// Read a string as if it were a Node stream
ss.readString('foo\nbar\n').pipe(process.stdout);

// Write some stream to a string
var stream = createSomeStream();
ss.writeString(stream).then(function (string) {
  console.log(string);
})
```

### `ss.readString(string[, options])`

Returns a [readable stream][] that will emit the given `string` as regular `data` events.
The number of `data` events fired depends on both the `string` and the `options` given to the
function, and should generally not be relied upon.  In particular, no `data` events are ever fired
if the passed string is empty.

The `options` object is currently unused.

### `ss.writeString(stream)`

Returns a [Promise][] that will eventually be fulfilled with the accumulated value read from the
passed [readable `stream`][].  If the passed stream emits an `error` event, the returned promise
will be rejected instead, with the emitted error as it rejection reason.

  [readable stream]: https://nodejs.org/api/stream.html#stream_class_stream_readable
  [promise]: https://www.promisejs.org/
