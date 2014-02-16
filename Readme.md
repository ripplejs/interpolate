# interpolate

[![Build Status](https://travis-ci.org/ripplejs/interpolate.png?branch=master)](https://travis-ci.org/ripplejs/interpolate)

  Interpolate a string using expressions, data and filters.

## Installation

  Install with [component(1)](http://component.io):

    $ component install ripplejs/interpolate

## Getting Started

Interpolate is a constructor function. You can set the delimiters and filters
on the interpolator once it has been created.

```js
var Interpolator = require('interpolate');
var interpolate = new Interpolator();

var result = interpolate.replace('Hello {{world}}! I am {{ (age / 2) + 7 }}.', {
  world: 'Pluto',
  age: 26
});
```

The `.replace` method replaces interpolation expressions within strings.

You can add filters:

```js
interpolate.filter('caps', function(val){
  return val.toUpperCase();
});

var result = interpolate.replace('Hello {{world | caps}}!', {
  world: 'Pluto',
  age: 26
});
```

Filters are piped, UNIX-style.

```js
interpolate.replace('Hello {{ world | caps | currency | makeItRed }}!')
```

You can also pass in arguments to filters

```js
interpolate.replace('Hello {{ world | date:%B %d, %Y at %I:%M%P }}');
```

Arguments start after `:` and are separated by a `,`. The filter function will
be passed the value first and the arguments after that, and should return the
value.

```
interpolate.filter('date', function(val, arg1, arg2) {
  return val;
});
```

In the previous example, you can wrap the args in quotes to send it through as
a single argument:

```js
interpolate.replace('Hello {{ world | date":%B %d, %Y at %I:%M%P" }}');
```

## API

### Interpolator()

Return a new interpolator

```js
var interpolate = new Interpolator();
```

### interpolate#filter(name, fn)

Add a new filter

```js
interpolate.filter('caps', function(val){
  return val.toUpperCase();
});
```

If the filter passes in arguments they will be sent to this function.

```js
interpolate.filter('date', function(val, date, time){
  return val;
});

interpolate.replace('Hello {{ world | date:%B %d, %Y at %I:%M%P }}');
```

Arguments are separated by a comma. The can be wrapped in quotes to return a single paramter:

```js
interpolate.filter('date', function(val, date){
  return val;
});

interpolate.replace('Hello {{ world | date:"%B %d, %Y at %I:%M%P" }}');
```

### interpolate#delimiters(regex)

Set the delimiters to use for expressions. Defaults to using `{{expr}}`-style.

This regex must match this format: `/\{\{([^}]+)\}\}/g`

The first match must be the contents of the delimiters and it must be a global match.

### interpolate#replace(string, data)

Replace the expressions within a string and return the new string. Use
this method when you know you want the returned value to be a string.

```js
var result = interpolate.replace('Hello {{world}}! I am {{ (age / 2) + 7 }}.', {
  world: 'Pluto',
  age: 26
});
```

### interpolate#props

You can get all of the properties needed for a string by passing a string to #props

```js
var deps = interpolate.props('Hello {{world}}');
// deps = ['world']
```

### interpolate#values(string, data)

Get the result of all expressions within a string

```js
var values = interpolate.values('Hi {{name}}, The items are {{items}} with {{items.length}}', {
  items: items,
  name: 'Fred'
});

values[0] === 'Fred'
values[1] === items
values[2] === 3
```

### interpolate#value(string, data)

Get the raw result of an expression instead of a string.

```js
var value = interpolate.value('{{items}}', {
  items: [1,2,3]
});

value === [1,2,3]
```

If there is more than a single expression, it is smart enough to realize that
you will want to interpolate a string and will switch the the `.replace` method.

```js
var value = interpolate.value('Hello {{name}}! You have {{messages.length}} messages', {
  name: 'Fred',
  messages: []
});

value === 'Hello Fred! You have 0 messages'
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
