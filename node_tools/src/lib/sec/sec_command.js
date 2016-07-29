const secEnum = require('./command_enum');
const CommandParser = require('./command_parser');

var SecCommand = function SecCommand(data) {
  if(typeof(data) != 'string')
    data = data.toString('hex');
  var buffer = Buffer.from(data, 'hex');
  this.rawBuffer = buffer;
  this.data = data;
  this.command = buffer.readUInt8(0);
  this.commandName = secEnum.byId[this.command];

  var comandExtender = CommandParser[this.command];
  if(typeof(comandExtender) == 'function')
    comandExtender.call(this, buffer);
}

var SecCommandPrototype = function SecCommandPrototype() {
  this.addChecksum = function addChecksum(keys, keyid) {
    var tmp = new Buffer(this.data, 'hex');
    var checksum = -(tmp.readInt32LE(0) + tmp.readInt32LE(4) + tmp.readInt32LE(8)) & 0xFFFFFFFF;
    tmp.writeInt32LE(checksum, 12);
    this.data =  tmp.toString('hex');
    return this;
  }
}
SecCommand.prototype = new SecCommandPrototype();
module.exports = SecCommand;
