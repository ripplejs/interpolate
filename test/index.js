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
        scope: {
          world: 'Pluto'
        }
      });
      assert(result === "Hello Pluto!");
    })

    it('should interpolate many properties in a string', function(){
      var result = interpolate.replace('Hello {{world}}! My name is {{name}} and I am {{ (age / 2) + 7 }}.', {
        scope: {
          world: 'Pluto',
          name: 'SpongeBob Squarepants',
          age: 26
        }
      });
      assert(result === 'Hello Pluto! My name is SpongeBob Squarepants and I am 20.');
    })

    it('should use filters', function(){
      var result = interpolate.replace('Hello {{world | caps}}!', {
        scope: {
          world: 'Pluto'
        }
      });
      assert(result === "Hello PLUTO!");
    })

    it('should use custom filters', function(){
      var result = interpolate.replace('Hello {{world | lower}}!', {
        filters: {
          lower: function(val){
            return val.toLowerCase();
          }
        },
        scope: {
          world: 'Pluto'
        }
      });
      assert(result === "Hello pluto!");
    })

    it('should return an empty string if the value is null', function(){
      var result = interpolate.replace('Hello {{world}}!', {
        scope: {
          world: null
        }
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
        scope: {
          greeting: 'Hello'
        }
      });
      assert(result === "Hello world!");
    });

    it('should return false for a false value', function(){
      var result = interpolate.replace('{{world}}', {
        scope: {
          world: false
        }
      });
      assert(result === "false");
    });

    it('should render zeroes', function(){
      var result = interpolate.replace('{{world}}', {
        scope: {
          world: 0
        }
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

    it('should get the properties when there are filters', function () {
      var props = interpolate.props('Hello {{world | foo}}! My name is {{user.name | bar}} and I am {{ (age / 2) + 7 | bar}}.');
      assert(props.length === 3);
      assert(props[0] === "world");
      assert(props[1] === "user");
      assert(props[2] === "age");
    });

  });

  describe('getting values', function () {

    it('should return the value of an interpolation', function () {
      var value = interpolate.value('{{world}}', {
        scope: {
          world: 'pluto'
        }
      });
      assert(value === 'pluto');
    });

    it('should return the value of an interpolation with context', function () {
      var value = interpolate.value('{{this.world}}', {
        context: {
          world: 'pluto'
        }
      });
      assert(value === 'pluto');
    });

    it('should return the input if there is no interpolation', function () {
      var value = interpolate.value('world', {
        scope: {
          world: 'pluto'
        }
      });
      assert(value === 'world');
    });

    it('should return the interpolated string if there is more than a single interpolation', function () {
      var value = interpolate.value('Hello {{world}}', {
        scope: {
          world: 'pluto'
        }
      });
      assert(value === 'Hello pluto');
    });

    it('should return the value of an interpolation if it is an array', function () {
      var items = [1,2,3];
      var value = interpolate.value('{{items}}', {
        scope: {
          items: items
        }
      });
      assert(value === items);
    });

    it('should return the value of an interpolation if it is a boolean', function () {
      var value = interpolate.value('{{hidden}}', {
        scope: {
          hidden: true
        }
      });
      assert(value === true);
    });

    it('should return the interpolated string with a true boolean', function () {
      var value = interpolate.value('it is {{hidden}}', {
        scope: {
          hidden: true
        }
      });
      assert(value === 'it is true');
    });

    it('should return the interpolated string with a false boolean', function () {
      var value = interpolate.value('it is {{hidden}}', {
        scope: {
          hidden: false
        }
      });
      assert(value === 'it is false');
    });

    it('should return an array with all of the values', function(){
      var items = [1,2,3];
      var values = interpolate.values('Hi {{name}}, The items are {{items}} with {{items.length}}', {
        scope: {
          items: items,
          name: 'Fred'
        }
      });
      assert(values[0] === 'Fred');
      assert(values[1] === items);
      assert(values[2] === 3);
    });

    it('should return the raw value even there is whitespace around the expression', function () {
      var items = [1,2,3];
      var value = interpolate.value('   {{items}}    ', {
        scope: {
          items: items
        }
      });
      assert(value === items);
    });


  });

  describe('checking for interpolation', function () {

    it('should find interpolation', function () {
      assert( interpolate.has('{{foo}}') );
    });

    it('should not find interpolation', function () {
      assert( interpolate.has('Hello world') === false );
    });

    it('should find interpolation in a long string', function () {
      assert( interpolate.has('Hello world, this is {{foo}}') );
    });

    it('should find interpolation in a string with multiple expression', function () {
      assert( interpolate.has('Hello {{world}}, this is {{foo}}') );
    });

    it('should find interpolation with custom delimiters', function () {
      interpolate.delimiters(/\<\%(.*?)\%\>/g);
      assert( interpolate.has('Hello {{world}}, this is {{foo}}') === false );
      assert( interpolate.has('Hello <% world %>, this is <% foo %>') );
    });

  });

  describe('iteration', function () {

    it('should iterate through expressions', function (done) {
      interpolate.each('Hello {{world}}, this is {{ foo | toUpperCase | toLowerCase:foo,bar }}', function(match, expr, filters, index){
        if(index === 0) {
          assert(match === "{{world}}");
          assert(expr === "world");
          assert(filters === '');
        }
        if(index === 1) {
          assert(match === "{{ foo | toUpperCase | toLowerCase:foo,bar }}");
          assert(expr === " foo ");
          assert(filters == " toUpperCase | toLowerCase:foo,bar ");
          done();
        }
      });
    });

    it('should not fail if there are no expressions', function (done) {
      interpolate.each('Hello world', function(){
        done(false);
      });
      done();
    });

    it('should map an expression', function () {
      var result = interpolate.map('Hello {{world}}, this is {{ foo | toUpperCase | toLowerCase:foo,bar }}', function(match, expr, filters, index){
        return filters;
      });
      assert(result[0] === '');
      assert(result[1] === " toUpperCase | toLowerCase:foo,bar ");
    });

    it('should not map if there are no expressions', function (done) {
      var result = interpolate.map('Hello world', function(){
        done(false);
      });
      assert(result.length === 0);
      done();
    });

    it('should map multiple expressions', function () {
      var result = interpolate.map('Hello {{world}}', function(match){
        return match;
      });
      var result2 = interpolate.map('{{Hello}} world', function(match){
        return match;
      });
      assert(result[0] === '{{world}}');
      assert(result2[0] === '{{Hello}}');
    });

  });


})