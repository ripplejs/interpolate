var Expression = require('expression');
var parse = require('format-parser');
var unique = require('uniq');
var props = require('props');

/**
 * Run a value through all filters
 *
 * @param  {Mixed}  val    Any value returned from an expression
 * @param  {Array}  types  The filters eg. currency | float | floor
 * @param  {Object} fns     Mapping of filter names, eg. currency, to functions
 * @return {Mixed}
 */
function filter(val, types, fns) {
  fns = fns || {};
  var filters = parse(types.join('|'));
  filters.forEach(function(f){
    var name = f.name.trim();
    var fn = fns[name];
    var args = f.args.slice();
    args.unshift(val);
    if(!fn) throw new Error('Missing filter named "' + name + '"');
    val = fn.apply(null, args);
  });
  return val;
}

/**
 * Create a new interpolator
 */
function Interpolate() {
  this.match = /\{\{([^}]+)\}\}/g;
  this.filters = {};
}

/**
 * Hook for plugins
 *
 * @param {Function} fn
 *
 * @return {Interpolate}
 */
Interpolate.prototype.use = function(fn) {
  fn(this);
  return this;
};

/**
 * Set the delimiters
 *
 * @param {Regex} match
 *
 * @return {Interpolate}
 */
Interpolate.prototype.delimiters = function(match) {
  this.match = match;
  return this;
};

/**
 * Check if a string matches the delimiters
 *
 * @param {String} input
 *
 * @return {Array}
 */
Interpolate.prototype.matches = function(input) {
  var test = new RegExp(this.match.source);
  var matches = test.exec(input);
  if(!matches) return [];
  return matches;
};

/**
 * Add a new filter
 *
 * @param {String} name
 * @param {Function} fn
 *
 * @return {Interpolate}
 */
Interpolate.prototype.filter = function(name, fn){
  this.filters[name] = fn;
  return this;
};

/**
 * Interpolate a string using the contents
 * inside of the delimiters
 *
 * @param  {String} input
 * @param  {Object} data    Data to pass to the expressions
 * @param  {Object} filters Mapping of filters
 * @return {String}
 */
Interpolate.prototype.exec = function(input, data){
  var parts = input.split('|');
  var expr = parts.shift();
  var fn = new Expression(expr);
  var val = fn.exec(data);
  if(parts.length) {
    val = filter(val, parts, this.filters);
  }
  return val;
};


/**
 * Check if a string has interpolation
 *
 * @param {String} input
 *
 * @return {Boolean}
 */
Interpolate.prototype.has = function(input) {
  return input.search(this.match) > -1;
};


/**
 * Interpolate as a string and replace each
 * match with the interpolated value
 *
 * @return {String}
 */
Interpolate.prototype.replace = function(input, data){
  var self = this;
  return input.replace(this.match, function(_, match){
    var val = self.exec(match, data);
    return (val == null) ? '' : val;
  });
};


/**
 * Get the interpolated value from a string
 */
Interpolate.prototype.value = function(input, data){
  var matches = this.matches(input);
  if( matches.length === 0 ) return input;
  if( matches[0].length !== input.length ) return this.replace(input, data);
  return this.exec(matches[1], data);
};


/**
 * Get all the interpolated values from a string
 *
 * @return {Array} Array of values
 */
Interpolate.prototype.values = function(input, data){
  var self = this;
  var matches = input.match(this.match);
  if( !matches ) return [];
  return matches.map(function(val){
    return self.value(val, data);
  });
};


/**
 * Find all the properties used in all expressions in a string
 * @param  {String} str
 * @return {Array}
 */
Interpolate.prototype.props = function(str) {
  var m;
  var arr = [];
  var re = this.match;
  while (m = re.exec(str)) {
    var expr = m[1];
    arr = arr.concat(props(expr));
  }
  return unique(arr);
};


module.exports = Interpolate;