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
 * Find all the properties used in all expressions in a string
 * @param  {String} str
 * @return {Array}
 */
function dependencies(str) {
  var m;
  var arr = [];
  var re = match;
  while (m = re.exec(str)) {
    var expr = m[1];
    arr = arr.concat(props(expr));
  }
  return unique(arr);
}

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
 * Interpolate a string
 * @param  {String} input
 * @param  {Object} data    Data to pass to the expressions
 * @param  {Object} filters Mapping of filters
 * @return {String}
 */
function interpolate(input, data, filters){
  return input.replace(match, function(_, match){
    var parts = match.split('|');
    var expr = parts.shift();
    var fn = new Expression(expr);
    var val = fn.exec(data);
    if(parts.length) {
      val = filter(val, parts, filters);
    }
    return val == null ? '' : val;
  });
}

/**
 * Export
 * @type {[type]}
 */
exports = module.exports = interpolate;

/**
 * Get all the properties used in all expressions in a string
 * @param  {String} str
 * @return {Array}
 */
exports.props = dependencies;