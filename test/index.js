var interpolate = require('interpolation');
var assert = require('assert');

describe('interpolation', function(){

  it('should do nothing with plain strings', function(){
    assert(interpolate('Hello world!') === 'Hello world!');
  })

  it('should interpolate properties in a string', function(){
    var result = interpolate('Hello {{world}}!', {
      world: 'Pluto'
    });
    assert(result === "Hello Pluto!");
  })

  it('should interpolate many properties in a string', function(){
    var result = interpolate('Hello {{world}}! My name is {{name}} and I am {{ (age / 2) + 7 }}.', {
      world: 'Pluto',
      name: 'SpongeBob Squarepants',
      age: 26
    });
    assert(result === 'Hello Pluto! My name is SpongeBob Squarepants and I am 20.');
  })

  it('should allow filters', function(){
    var result = interpolate('Hello {{world | caps}}!', {
      world: 'Pluto'
    }, {
      caps: function(val) {
        return val.toUpperCase();
      }
    });
    assert(result === "Hello PLUTO!");
  })

  it('should return an empty string if the value is null', function(){
    var result = interpolate('Hello {{world}}!', {
      world: null
    });
    assert(result === "Hello !");
  })

  it('should return an empty string if the value is undefined', function(){
    var result = interpolate('Hello {{world}}!', {});
    assert(result === "Hello !");
  })
})