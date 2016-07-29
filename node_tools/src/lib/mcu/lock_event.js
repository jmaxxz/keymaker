const lockStateEnum = require('./lock_state_enum');
const causeEnum = require('./cause_enum');

module.exports = function(buffer) {
  switch(this.msgNumber) {
    case 0:
      this.lockState = lockStateEnum.byId[buffer.readUInt8(9)];
      this.timeStamp = buffer.readUInt32LE(4);
      this.cause = causeEnum.byId[buffer.readUInt8(8)];
      this.lastKey = buffer.readUInt8(11);
    break;

    case 1:
      this.coulombCounter = buffer.readUInt32LE(8);
      this.currentAngularPostion = buffer.readInt16LE(4);
      this.currentSamples = [ buffer.readUInt16LE(12), buffer.readUInt16LE(14)]; //mA
      this.targetAngularPosition = buffer.readInt16LE(6);
    break;

    case 2:
      this.currentSamples = [
        buffer.readUInt16LE(4),
        buffer.readUInt16LE(6),
        buffer.readUInt16LE(8),
        buffer.readUInt16LE(10),
        buffer.readUInt16LE(12),
        buffer.readUInt16LE(14)
      ]; //mA
    break;

    case 3:
      this.batteryLevel = buffer.readUInt16LE(10);//mv
      this.currentSamples = [
        buffer.readUInt16LE(6),
        buffer.readUInt16LE(8)
      ]; //mA
    break;
  }
}
