# interpolate

[![Build Status](https://travis-ci.org/ripplejs/interpolate.png?branch=master)](https://travis-ci.org/ripplejs/interpolate)

  Interpolate a string using expressions, data and filters.

## Installation

  Install with [component(1)](http://component.io):

    $ component install ripplejs/interpolate

## API

Interpolate is a function that takes a string, some data and some optional
filters.

```js
var result = interpolate('Hello {{world}}! I am {{ (age / 2) + 7 }}.', {
  world: 'Pluto',
  age: 26
});
```

You can pass filters in as a third parameter:

```js
var data = {
  world: 'Pluto',
  age: 26
};

var filters = {
  caps: function(val){
    return val.toUpperCase();
  }
};

var result = interpolate('Hello {{world | caps}}!', data, filters);
```

Filters are piped, UNIX-style.

```js
interpolate('Hello {{ world | caps | currency | makeItRed }}!')
```

You can also pass in arguments to filters

```js
interpolate('Hello {{ world | date:%B %d, %Y at %I:%M%P }}');
```

Arguments start after `:` and are separated by a `,`. The filter function will
be passed the value first and the arguments after that, and should return the
value.

```
function date(val, arg1, arg2) {
  return val;
}
```

In the previous example, you can wrap the args in quotes to send it through as
a single argument:

```js
interpolate('Hello {{ world | date":%B %d, %Y at %I:%M%P" }}');
```

## Get Dependencies

You can get all of the properties needed for a string by passing a string to #props

```js
var deps = interpolate.props('Hello {{world}}');
// deps = ['world']
```

## License

  The MIT License (MIT)

  Copyright (c) 2014 <copyright holders>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
