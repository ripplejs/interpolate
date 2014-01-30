var Expression = require('expression');

function hasInterpolation(str) {
  return ~str.indexOf('{');
}

function executeFilters(val, types, filters) {
  var filter;
  while(types.length) {
    filter = filters[types.shift().trim()];
    if(!filter) {
      throw new Error('Missing filter named (' + name + ')');
    }
    val = filter(val);
  }
  return val;
}

module.exports = function(input, data, filters){
  if(!hasInterpolation(input)) return input;
  return input.replace(/\{\{([^}]+)\}\}/g, function(_, match){
    var parts = match.split('|');
    var expr = parts.shift();
    var fn = new Expression(expr);
    var val = fn.exec(data);
    if(filters) val = executeFilters(val, parts, filters);
    return val == null ? '' : val;
  });
};
