var Interpolate = require('interpolate');
var assert = require('assert');

describe('interpolation', function(){
  var interpolate;

  beforeEach(function () {
    interpolate = new Interpolate();

    interpolate.filter('caps', function(val) {
      return val.toUpperCase();
    });

    interpolate.filter('append', function(val, text) {
      return val + text;
    });
  });

  describe('relacing values in strings', function () {

    it('should do nothing with plain strings', function(){
      assert(interpolate.replace('Hello world!') === 'Hello world!');
    })

    it('should interpolate properties in a string', function(){
      var result = interpolate.replace('Hello {{world}}!', {
        world: 'Pluto'
      });
      assert(result === "Hello Pluto!");
    })

    it('should interpolate many properties in a string', function(){
      var result = interpolate.replace('Hello {{world}}! My name is {{name}} and I am {{ (age / 2) + 7 }}.', {
        world: 'Pluto',
        name: 'SpongeBob Squarepants',
        age: 26
      });
      assert(result === 'Hello Pluto! My name is SpongeBob Squarepants and I am 20.');
    })

    it('should use filters', function(){
      var result = interpolate.replace('Hello {{world | caps}}!', {
        world: 'Pluto'
      });
      assert(result === "Hello PLUTO!");
    })

    it('should return an empty string if the value is null', function(){
      var result = interpolate.replace('Hello {{world}}!', {
        world: null
      });
      assert(result === "Hello !");
    })

    it('should return an empty string if the value is undefined', function(){
      var result = interpolate.replace('Hello {{world}}!', {});
      assert(result === "Hello !");
    })

    it('should throw an error if a filter is missing', function(){
      try {
        interpolate.replace('Hello {{world | lower}}!');
      }
      catch(e) {
        var message = e.message;
      }
      assert(message === 'Missing filter named "lower"');
    });

    it('should allow filters with arguments', function(){
      var result = interpolate.replace('{{greeting | append:" world!" }}', {
        greeting: 'Hello'
      });
      assert(result === "Hello world!");
    });

    it('should return false for a false value', function(){
      var result = interpolate.replace('{{world}}', {
        world: false
      });
      assert(result === "false");
    });

    it('should render zeroes', function(){
      var result = interpolate.replace('{{world}}', {
        world: 0
      });
      assert(result === "0");
    });


  });

  describe('getting properties', function () {

    it('should get all the properies used in a string', function(){
      var props = interpolate.props('Hello {{world}}! My name is {{user.name}} and I am {{ (age / 2) + 7 }}.');
      assert(props.length === 3);
      assert(props[0] === "world");
      assert(props[1] === "user");
      assert(props[2] === "age");
    });

  });

  describe('getting values', function () {

    it('should return the value of an interpolation', function () {
      var value = interpolate.value('{{world}}', {
        world: 'pluto'
      });
      assert(value === 'pluto');
    });

    it('should return the input if there is no interpolation', function () {
      var value = interpolate.value('world', {
        world: 'pluto'
      });
      assert(value === 'world');
    });

    it('should return the interpolated string if there is more than a single interpolation', function () {
      var value = interpolate.value('Hello {{world}}', {
        world: 'pluto'
      });
      assert(value === 'Hello pluto');
    });

    it('should return the value of an interpolation if it is an array', function () {
      var items = [1,2,3];
      var value = interpolate.value('{{items}}', {
        items: items
      });
      assert(value === items);
    });

    it('should return the value of an interpolation if it is a boolean', function () {
      var value = interpolate.value('{{hidden}}', {
        hidden: true
      });
      assert(value === true);
    });

    it('should return the interpolated string with a true boolean', function () {
      var value = interpolate.value('it is {{hidden}}', {
        hidden: true
      });
      assert(value === 'it is true');
    });

    it('should return the interpolated string with a false boolean', function () {
      var value = interpolate.value('it is {{hidden}}', {
        hidden: false
      });
      assert(value === 'it is false');
    });

    it('should return an array with all of the values', function(){
      var items = [1,2,3];
      var values = interpolate.values('Hi {{name}}, The items are {{items}} with {{items.length}}', {
        items: items,
        name: 'Fred'
      });
      assert(values[0] === 'Fred');
      assert(values[1] === items);
      assert(values[2] === 3);
    });


  });


})