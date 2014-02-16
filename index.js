var Expression = require('expression');
var parse = require('format-parser');
var unique = require('uniq');
var props = require('props');

/**
 * Regex to match expressions
 * @type {RegExp}
 */
var match = /\{\{([^}]+)\}\}/g;

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
 * Interpolate a string using the contents
 * inside of the delimiters
 *
 * @param  {String} input
 * @param  {Object} data    Data to pass to the expressions
 * @param  {Object} filters Mapping of filters
 * @return {String}
 */
var interpolate = exports.interpolate = function(str, data, filters){
  var parts = str.split('|');
  var expr = parts.shift();
  var fn = new Expression(expr);
  var val = fn.exec(data);
  if(parts.length) {
    val = filter(val, parts, filters);
  }
  return val;
}

/**
 * Interpolate as a string and replace each
 * match with the interpolated value
 *
 * @return {String}
 */
exports.replace = function(input, data, filters){
  return input.replace(match, function(_, match){
    var val = interpolate(match, data, filters);
    return (val == null) ? '' : val;
  });
};


/**
 * Get the interpolated value from a string
 */
exports.value = function(input, data, filters){
  var test = new RegExp(match);
  var matches = test.exec(input);
  if( !matches ) return input;
  if( matches[0].length !== input.length ) return exports.replace(input, data, filters);
  return interpolate(matches[1], data, filters);
};


/**
 * Get all the interpolated values from a string
 *
 * @return {Array} Array of values
 */
exports.values = function(input, data, filters){
  var matches = input.match(match);
  if( !matches ) return [];
  return matches.map(function(val){
    return exports.value(val, data, filters);
  });
};


/**
 * Find all the properties used in all expressions in a string
 * @param  {String} str
 * @return {Array}
 */
exports.props = function(str) {
  var m;
  var arr = [];
  var re = match;
  while (m = re.exec(str)) {
    var expr = m[1];
    arr = arr.concat(props(expr));
  }
  return unique(arr);
};