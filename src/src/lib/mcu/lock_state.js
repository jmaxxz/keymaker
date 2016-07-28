const lockStateEnum = require('./lock_state_enum');
const causeEnum = require('./cause_enum');

module.exports = function(buffer, start) {
      this.commandName = 'LockState';
      this.lockState = lockStateEnum.byId[buffer.readUInt8(9)];
      this.timeStamp = buffer.readUInt32LE(4);
      this.cause = causeEnum.byId[buffer.readUInt8(8)];
      this.lastKey = buffer.readUInt8(11);
}
