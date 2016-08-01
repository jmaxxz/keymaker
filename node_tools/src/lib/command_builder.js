const SecCommand = require('./sec/sec_command');
const McuCommand = require('./mcu/mcu_command');
const constraint = require('./constraint');
const crypto = require('crypto');

exports.readSecFlash = function readSecFlash(page) {
  var temp = new Buffer('41000000000000000000000000000000', 'hex');
  temp.writeUInt16BE(page, 1);
  return new SecCommand(temp.toString('hex')).addChecksum();
}

exports.finializeSessionKey = function finializeSessionKey() {
  var nonce = crypto.randomBytes(8).toString('hex');
  // write to SEC
  // encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2><chksum>'
  return new SecCommand('03000000' + nonce + '00000000').addChecksum();
}

exports.sendSessionKey = function sendSessionKey(lowerHalfOfKey) {
  if(lowerHalfOfKey.length !== 16) { // Assuming hex encoded string
    throw('Half of session key should be 64bits long not: ' + lowerHalfOfKey.length);
  }
  //write to SEC
  //encryption key 0f00 is generally used for this
  //                 '<  cmd ><Param1><Param2>'
  return new SecCommand('01000000' + lowerHalfOfKey + '00000000').addChecksum();
}

exports.sendSessionKeyPt2 = function sendSessionKeyPt2(upperHalfOfKey) {
  if(upperHalfOfKey.length !== 16) { // Assuming hex encoded string
    throw('Half of session key should be 64bits long not: ' + upperHalfOfKey.length);
  }

  // Sent from lock to computer or phone.
  // used in order to be able to print out plantext for
  // message which august webservers decrpted for us.
  return new SecCommand('02000000' + upperHalfOfKey + '00000000').addChecksum();
}

exports.getBatteryLevel = function getBatteryLevel() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee020000050000000000000000000000').addChecksum();
}
exports.getRtc = function getRtc() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee0200040a0000000000000000000000').addChecksum();
}

exports.getGitVersion = function getGitVersion() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee020000290000000000000000000000').addChecksum();
}
exports.getAngle = function getAngle() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee020000030000000000000000000000').addChecksum();
}

exports.getArmVersion = function getArmVersion() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee0200002c0000000000000000000000').addChecksum();
}

exports.getNumberOfLogEntries = function getNumberOfLogEntries() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee020000090000000000000000000000').addChecksum();
}

exports.getLockLogEntry = function getLockLogEntry() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee000000000000000000000000000000').addChecksum();
}

exports.isLockSpeakerOn = function isLockSpeakerOn() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee040000380000000000000000000000').addChecksum();
}

exports.clearLog = function clearLog() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee060000000000000000000000000000').addChecksum();
}

exports.clearNotifications = function clearNotifications() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee0f0000000000000000000000000000').addChecksum();
}

exports.factoryReset = function factoryReset() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee240000000000000000000000000000').addChecksum();
}

exports.playSound = function playSound(soundId) {
  constraint.isByte(soundId, 'soundId');

  var temp = new Buffer('ee0d0000000000000000000000000000', 'hex');
  temp.writeUInt8(soundId, 4);
  return new McuCommand(temp.toString('hex')).addChecksum();
}

exports.playLed = function playLed(movieId) {
  constraint.isByte(movieId, 'movieId');

  var temp = new Buffer('ee0e0000000000000000000000000000', 'hex');
  temp.writeUInt8(movieId, 4);
  return new McuCommand(temp.toString('hex')).addChecksum();
}

exports.getParameter = function getParameter(parameterId) {
  constraint.isByte(parameterId, 'parameterId');

  var temp = new Buffer('ee040000000000000000000000000000', 'hex');
  temp.writeUInt8(parameterId, 4);
  return new McuCommand(temp.toString('hex')).addChecksum();
}

exports.setParameter = function setParameter(parameterId, value) {
  constraint.isByte(parameterId, 'parameterId');
  constraint.isInt32(value, 'value');

  //                    '<  cmd ><Param1><Param2>'
  var temp = new Buffer('ee030000000000000000000000000000', 'hex');
  temp.writeUInt8(parameterId, 4);
  temp.writeInt32LE(value, 8);
  return new McuCommand(temp.toString('hex')).addChecksum();
}

exports.isAutoRelockerOn = function isAutoRelockerOn() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee040000280000000000000000000000').addChecksum();
}

exports.setAutorelock = function setAutorelock(seconds) {
  constraint.isUInt16(seconds);
  //                    '<  cmd ><Param1><Param2>'
  var temp = new Buffer('ee030000280000000000000000000000', 'hex');
  temp.writeUInt16LE(seconds, 8); // This one is not actually needed
  temp.writeUInt16LE(seconds, 10);
  return new McuCommand(temp.toString('hex')).addChecksum();
}

exports.stageOfflineKeyPt1 = function stageOfflineKeyPt1(keyPart1) {
  if(keyPart1 instanceof Buffer){
    keyPart1 = keyPart1.toString('hex');
  }

  var temp = new Buffer('11000000' + keyPart1 + '00000000', 'hex');
  return new SecCommand(temp.toString('hex')).addChecksum();
}

exports.stageOfflineKeyPt2 = function stageOfflineKeyPt2(keyPart2) {
  if(keyPart2 instanceof Buffer){
    keyPart2 = keyPart2.toString('hex');
  }

  var temp = new Buffer('13000000' + keyPart2 + '00000000', 'hex');
  return new SecCommand(temp.toString('hex')).addChecksum();
}

exports.commitOfflineKey = function commitOfflineKey(key, keyId, mode) {
  constraint.isInt(keyId, 'keyId')
  constraint.isBetweenInclusive(keyId, 'keyId', 0, 255)

  if(keyId === 0 && mode !== 'DangerZone'){
    /*
    * Why is this dangerous?
    *
    * The firmware key is the only key which can be used
    * to add new keys. If the firmware key is set to a value
    * and that value can not be recalled you will brick your lock.
    * Unless you have other offline keys are are able to find a
    * way to reinsert a offline key which does not require the
    * use of the firmware key.
    *
    * If you have been warned. Comment out this check at your
    * own perl.
    */
    throw 'DANGER!!! while we can set a key at id 0 it is very dangerous '
    +'as key id 0 is the firmware key. Comment out this safety check if '
    +'you know what you are doing.';
  }

  if(key instanceof Buffer) {
    key = key.toString('hex');
  }

  var temp = new Buffer('15000000000000000000000000000000', 'hex');
  var keyBuffer = new Buffer(key, 'hex');
  var checksum = (-(keyBuffer.readInt32LE(0) + keyBuffer.readInt32LE(4)
    + keyBuffer.readInt32LE(8) + keyBuffer.readInt32LE(12))) & 0xFFFFFFFF;

  temp.writeInt32LE(checksum, 4);
  temp.writeUInt8(keyId, 8);

  return new SecCommand(temp.toString('hex')).addChecksum();
}

exports.clearKeySlot = function clearKeySlot(keyId, mode) {
  constraint.isUInt(keyId, 'keyId');
  constraint.isBetweenInclusive(keyId, 'keyId', 0, 255);

  if(keyId === 0 && mode !== 'DangerZone') {
    /*
    * Why is this dangerous?
    *
    * The firmware key is the only key which can be used
    * to add new keys. If the firmware key is set to a value
    * and that value can not be recalled you will brick your lock.
    * Unless you have other offline keys are are able to find a
    * way to reinsert an offline key which does not require the
    * use of the firmware key.
    *
    * If you have been warned. Comment out this check at your
    * own perl.
    */
    throw 'DANGER!!! while we can clear the key at index 0 it is very dangerous '
    +'as key index 0 is the firmware key. Comment out this safety check if '
    +'you know what you are doing.';
  }

  var temp = new Buffer('17000000000000000000000000000000', 'hex');
  temp.writeUInt8(keyId, 4);

  return new SecCommand(temp.toString('hex')).addChecksum();
}

exports.unlock = function unlock () {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee0a0000000000000000000000000000').addChecksum();
}

//TODO: figure out how this actually works
//This is unsafe to use for the time being.
exports.rotate = function rotate (deg) {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  var temp = new Buffer('ee070000030000000000000000000000', 'hex');
  temp.writeInt32LE(deg, 8);
  return new McuCommand(temp.toString('hex')).addChecksum();
}

exports.lock = function lock() {
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee0b0000000000000000000000000000').addChecksum();
}

exports.getLockState = function getLockState() {
  //write to SEC
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee020000020000000000000000000000').addChecksum();
}

exports.disconnect = function disconnect() {
  //write to SEC
  //encryption key 0f00 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new SecCommand('05000000000000000000000000000000').addChecksum();
}

exports.getOtaStatus = function getOtaStatus() {
  // OTA Slice info FFFF FFFF FFFF FFFF + crc32;
  // 8 bytes bitmask, and a 4 byte checksum
  return new McuCommand('ee140000000000000000000000000000').addChecksum();
}

exports.writeSlice = function writeSlice(data) {
  throw 'Needs more work.';
  constraint.isOfLength(data, 'data', 24);
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee150000' + data).addChecksum();
}

exports.createAsset = function createAsset(i1, i2, length, crc32) {
  throw 'Needs more work.';
  var temp = new Buffer('ee160000000000000000000000000000', 'hex');
  temp.writeUInt16LE(i1, 4);
  temp.writeUInt16LE(i2, 6);
  temp.writeUInt32LE(length, 8);
  temp.writeUInt32LE(crc32, 12);
  return new McuCommand(temp.toString('hex'));
}

exports.getAssetInfo = function getAssetInfo() {
  throw 'Needs more work.';
  // OTA Slice info FFFF FFFF FFFF FFFF + crc32;
  return new McuCommand('ee170000000000000000000000000000').addChecksum();
}

exports.deleteAsset = function clearAssetStore() {
  throw 'Needs more work.';
  return new McuCommand('ee180000000000000000000000000000').addChecksum();
}

exports.querySlice = function querySlice() {
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee190000000000000000000000000000').addChecksum();
}

exports.clearAssetStore = function clearAssetStore() {
  return new McuCommand('ee1c0000000000000000000000000000').addChecksum();
}

exports.setAndModifyCurrentSlice = function setAndModifyCurrentSlice() {
  throw 'Needs more work.';
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand('ee1d0000000000000000000000000000').addChecksum();
}

exports.setRTC = function setRTC(time) {
  constraint.isUInt32(time, 'time');
  var temp = new Buffer('ee100000000000000000000000000000', 'hex');
  temp.writeUInt32(time, 4);
  //write to MCU
  //encryption key 0200 is generally used for this
  //                    '<  cmd ><Param1><Param2>'
  return new McuCommand(temp.toString('hex')).addChecksum();
}
