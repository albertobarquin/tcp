# utc-clock

A simple UTC clock, which can be used to determine the current UTC date/time in milliseconds since 1970/01/01 or formatted as ISO string.

```js
var UTCClock = require('utc-clock');
var clock = new UTCClock(/* optional: offset in milliseconds */);

console.log(clock.now.ms()); // prints the current utc timestamp in milliseconds since 1970/01/01
console.log(clock.now.iso()); // prints the current utc timestamp in ISO format
```

Consecutive calls to `clock.now.ms()` or `clock.now.iso()` will always return the current timestamp!

#### Offset
The `UTCClock` constructor function supports a single `offset` argument to specify an offset in milliseconds. Use negative numbers to set the clock the according number of milliseconds ahead.

```js
var UTCClock = require('utc-clock');
var clock = new UTCClock(-1 * 1000 * 60 * 60 * 24); // set the clock a day ahead 
```

Changes the offset on an existing clock, will affect all following calls to `.now.ms()` and `.now.iso()`.
```js
var UTCClock = require('utc-clock');
var clock = new UTCClock(); // no offset
console.log(clock.now.iso()); // e.g. prints 2015-12-24T00:07:00.000Z

clock.offset = -1 * 1000 * 60 * 60 * 24; // set the clock a day ahead 
console.log(clock.now.iso()); // e.g. prints 2015-12-23T00:07:00.000Z

clock.offset = 0; // reset/delete offset
console.log(clock.now.iso()); // e.g. prints 2015-12-24T00:07:00.000Z again
```
