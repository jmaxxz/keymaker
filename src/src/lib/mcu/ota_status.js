const parameterEnum = require('./ota_status');
module.exports = function(buffer, start) {
  this.commandName = 'OtaStatus';
  this.bitmap = buffer.toString('hex', 4, 12);
  this.crc32 = buffer.readInt32LE(12);
}
