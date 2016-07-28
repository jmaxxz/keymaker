throw('This is very much so a work in progress, it does not work at all today. Running it may corrupt your lock.');
const lockScanner = require('./lib/lock_scanner');
const Session = require('./lib/offline_session');
const Keychain = require('./lib/keychain');
const util = require('util');
const delay = require('./lib/delay');
const cmd = require('./lib/command_builder');
const sounds = require('./lib/mcu/sound_enum');
const mcuEnum = require('./lib/mcu/command_enum');
const McuCommand = require('./lib/mcu/mcu_command');
const fs = require('fs');
const crc = require('crc');
const environmentConfig = require('../environment.json');
const Environment = require('./lib/environment')
require('./lib/async_logging');


const environment = new Environment(environmentConfig);
var firmware = fs.readFileSync('examples/firmware/arm/1.0.28.img');
var firmwareCrc = crc.crc32(firmware);

function log(channel, data) {
  console.log(channel + ': ' + data.toString('hex'));
}

async function onLockResponse(session, data) {
  var command = new McuCommand(data.substring(0,32));
  var cmdName = mcuEnum.byId[command.command];
  switch(cmdName) {
    case 'OtaError':
      console.log('Error!')
      process.exit();
    break;
    case 'OtaQueryStatus':
      console.log('index: ' + command.msgNumber)
      console.log('bitmap: ' + command.bitmap);
      console.log('crc32: ' + command.crc32);
    break;
    case 'OtaQuerySlice':
      console.log('index: ' + command.msgNumber)
      console.log('bitmap: ' + command.bitmap);
      console.log('crc32: ' + command.crc32);
    break;
  }
}

async function onSessionStart(session) {
  session.on('mcuUpdate', d=>onLockResponse(session, d));
  console.log("fwl: "+firmware.length);
  await session.mcuWrite(cmd.createAsset(1, 10, firmware.length, firmwareCrc).data);
  for (var i = 0; i < 768; i++) {
    await session.mcuWrite(cmd.writeSlice(firmware.toString('hex', i*12, i*12 + 12)).data);
  }
  //await session.mcuWrite(cmd.setAndModifyCurrentSlice('0203040506070809').data);
  //await delay(500);
}

lockScanner.on('lockFound', async lock => {
  console.log('Connected to', lock.id);
  var keychain = environment.createKeychainForLock(lock.id);
  if(!keychain) {
    console.log('No offline keys for lock.');
    return;
  }
  try {
    var session = new Session(lock, keychain, '0f00');
    session.on('secWrite', d=>log('comp->sec', d));
    session.on('mcuWrite', d=>log('comp->mcu', d));
    session.on('secUpdate', d=>log('sec->comp', d));
    session.on('mcuUpdate', d=>log('mcu->comp', d));
    session.once('established', d=>onSessionStart(session));
    lock.on('error', d=>log('err', d));
    session.on('error', d=>log('err', d));
    await session.establish();
  } catch (e) {
    console.log(e);
  }
});

lockScanner.on('error', e => console.log(e));
lockScanner.start();
