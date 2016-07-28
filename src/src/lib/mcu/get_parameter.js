const parameterEnum = require('./parameter_enum');
module.exports = function(buffer, start) {
  this.commandName = 'GetParameter'
  this.valueName = parameterEnum.byId[buffer.readUInt8(4)];
  this.value = buffer.readInt32LE(8);
}
