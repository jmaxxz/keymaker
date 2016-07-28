var Enum = function Enum(mapping){
  this.byId = mapping;
  this.byName = {};
  var keys = Object.keys(mapping);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    this.byName[mapping[key]] = ~~key;
  }
}

module.exports = Enum;
