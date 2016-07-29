const lockScanner = require('./lib/lock_scanner');
const Session = require('./lib/offline_session');
const Keychain = require('./lib/keychain');
const util = require('util');
const delay = require('./lib/delay');
const cmd = require('./lib/command_builder');
const sounds = require('./lib/mcu/sound_enum');
const secEnum = require('./lib/sec/command_enum');
const SecCommand = require('./lib/sec/sec_command');
const environmentConfig = require('../environment.json');
const Environment = require('./lib/environment')
const fs = require('fs');
require('./lib/async_logging');

// Be sure and delete this file prior to reading out a new lock
// it is not automatically recreated because the lock has a
// tendency to stop responding after 6000ish reads on one of my
// locks. as such in order to get a complete read of the flash
// one must run this app multiple time changing the starting
// index on each run. If application hangs just rerun using
// the last number logged to the console as the starting index.
var startingIndex = 0;
var logStream = fs.createWriteStream('flash.bin', {'flags': 'a'});

const environment = new Environment(environmentConfig);

async function onSecResponse(session, data, state) {
  let secCmd = new SecCommand(data);
  if(secEnum.byId[secCmd.commandAsByte] == 'ResponseGetFlashPageData'){
    let i = secCmd.rawBuffer.readUInt16BE(1)+1;
    await logStream.write(new Buffer(secCmd.parameter1 + secCmd.parameter2, 'hex'));
    console.log('Requesting:', i);
    await session.secWrite(cmd.readSecFlash(i).data);
  } else {
    console.log(data);
  }
}

async function onSessionStart(session) {
  session.on('secUpdate', d=>onSecResponse(session, d));
  await session.secWrite(cmd.readSecFlash(startingIndex).data);
}

lockScanner.on('lockFound', async lock => {
  console.log('Connected to', lock.id);
  var keychain = environment.createKeychainForLock(lock.id);
  if(!keychain) {
    console.log('No offline keys for lock.');
    return;
  }

  try {
    var session = new Session(lock, keychain);
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
