const McuStatus = require('./status_parser');
const CommandParser = require('./command_parser');

var McuCommand = function McuCommand(data) {
  if(typeof(data) != 'string')
    data = data.toString('hex');
  var buffer = new Buffer(data, 'hex');
  this.data = data;

  // bb == response
  // ee == command
  // aa == acknowledge
  //
  this.magic = buffer.readUInt8(0);
  this.command = buffer.readUInt8(1);
  var comandExtender = CommandParser[this.command];
  this.msgNumber = buffer.readUInt8(2);
  this.checksum = buffer.readUInt8(3);

  if(typeof(comandExtender) == 'function')
    comandExtender.call(this, buffer);
}


McuCommand.prototype.addChecksum = function addChecksum(keys, keyid) {
  var tmp = new Buffer(this.data, 'hex');
  var originalChecksum = tmp.readUInt8(3);
  tmp[3] = 0x00; //Replace previous checksum
  var checksum =0;
  for (var i = tmp.length - 1; i >= 0; i--) {
    checksum = (checksum + tmp.readUInt8(i)) & 0xFF
  }
  var checksum = (254-checksum) & 0xFF;
  tmp.writeUInt8(checksum, 3);
  this.data = tmp.toString('hex');
  return this;
}

McuCommand.prototype.toString = function toString() {
  return JSON.stringify(this, null, 2);
}


module.exports = McuCommand;
