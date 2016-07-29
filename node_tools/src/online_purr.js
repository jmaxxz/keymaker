const lockScanner = require('./lib/lock_scanner');
const Session = require('./lib/online_session');
const Keychain = require('./lib/keychain');
const util = require('util');
const delay = require('./lib/delay');
const cmd = require('./lib/command_builder');
const sounds = require('./lib/mcu/sound_enum');
const environmentConfig = require('../environment.json');
require('./lib/async_logging');

function log(channel, data) {
  console.log(channel + ': ' + data.toString('hex'));
}

async function onSessionStart(session) {
  try {
    await session.mcuWrite(cmd.playSound(sounds.byName['purr']).data);
    await delay(500);
    process.exit();
  } catch(e) {
    console.log(e)
  }
}

lockScanner.on('lockFound', async lock => {
  try {
    var session = new Session(lock, environmentConfig.api);
    session.on('secWrite', d=>log('comp->sec', d));
    session.on('mcuWrite', d=>log('comp->mcu', d));
    session.on('secUpdate', d=>log('sec->comp', d));
    session.on('mcuUpdate', d=>log('mcu->comp', d));
    session.once('established', d=>onSessionStart(session));
    lock.on('error', d=>log('err', d));
    await session.establish();
  } catch (e) {
    console.log(e);
  }
});

lockScanner.on('error', e => console.log(e));
lockScanner.start();
