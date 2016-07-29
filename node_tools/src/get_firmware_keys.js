const Api = require('./lib/rest/api.js');
const util = require('util');
const environmentConfig = require('../environment.json');
require('./lib/async_logging');

var api = new Api(environmentConfig.api);

async function main() {
  try{
    var locks = await api.getLocks();
    var lockIds = Object.keys(locks);

    for (var i = 0; i < lockIds.length; i++) {
      var l = locks[lockIds[i]];
      var firmware = await api.getTiFirmware(lockIds[i], '1.1.18');
      var extraDataStart = firmware.length - 68;
      var serialNumber = firmware.toString('ascii', extraDataStart, extraDataStart + 10);
      var readLockId = firmware.toString('hex', extraDataStart + 16, extraDataStart + 32);
      var firmwareKey = firmware.toString('hex', extraDataStart + 48, extraDataStart + 64);
      console.log(l);
      console.log('sn: '+ serialNumber);
      console.log('id: '+ readLockId);
      console.log('key: '+ firmwareKey);
    }
  } catch(e) {
    console.log(e);
  }
}

main();
