const statusEnum = require('./status_enum');
const lockStateEnum = require('./lock_state_enum');
module.exports = function(buffer, start) {
  // Welp the first part of the message has already been read
  // let's ignore it!
  this.commandName = 'GetStatus'
  this.statusType = buffer.readUInt8(4);
  this.valueName = statusEnum.byId[this.statusType];
  switch(this.valueName){
    case 'LockState':
      this.lockState = lockStateEnum.byId[buffer.readUInt32LE(8)];
    break;

    case 'GitHash':
      this.gitHash = buffer.toString('hex', 8, 12);
    break;

    case 'ArmVersion':
      this.armVersionBuild = buffer.readUInt8(8);
      this.armVersionMinor = buffer.readUInt8(9);
      this.armVersionMajor = buffer.readUInt8(10);
      this.armVersion = this.armVersionMajor + '.' + this.armVersionMinor + '.' + this.armVersionBuild;
    break;

    case 'BatteryLevel':
      this.batteryLevel = buffer.readUInt8(8); //In percent
    break;

    case 'Rtc':
      this.rtc = new Date(buffer.readUInt32LE(8)*1000);
    break;

    case 'UnreadEventCount':
      this.unreadEventCount = buffer.readUInt8(8);
    break;

    case 'AngleOfLock':
      this.angleOfLock = buffer.readInt16LE(8); //units unknown
    break;
  }
}
