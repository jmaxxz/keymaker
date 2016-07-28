var SecCommand = function SecCommand(data) {
  if(typeof(data) != 'string')
    data = data.toString('hex');
  var buffer = new Buffer(data, 'hex');
  this.rawBuffer = buffer;
  this.data = data;
  this.shortCommand = data.substring(0, 2);
  this.parameter1 = data.substring(8, 16);
  this.parameter2 = data.substring(16, 24);
  this.parameter1AsInt = buffer.readUInt32LE(4);
  this.parameter2AsInt = buffer.readUInt32LE(8);
  this.command = data.substring(0, 8);
  this.commandAsInt = buffer.readUInt32LE(0);
  this.commandAsByte = buffer.readUInt8(0);
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
