var Expression = require('expression');
var parse = require('format-parser');

function executeFilters(val, types, fns) {
  fns = fns || {};
  var filters = parse(types.join('|'));
  filters.forEach(function(filter){
    var name = filter.name.trim();
    var fn = fns[name];
    var args = filter.args.slice();
    args.unshift(val);
    if(!fn) throw new Error('Missing filter named "' + name + '"');
    val = fn.apply(null, args);
  });
  return val;
}

module.exports = function(input, data, filters){
  return input.replace(/\{\{([^}]+)\}\}/g, function(_, match){
    var parts = match.split('|');
    var expr = parts.shift();
    var fn = new Expression(expr);
    var val = fn.exec(data);
    if(parts.length) {
      val = executeFilters(val, parts, filters);
    }
    return val == null ? '' : val;
  });
};
