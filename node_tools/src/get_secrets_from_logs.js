const glob = require('glob');
const fs = require('fs');
require('./lib/async_logging');

const matchers = [
  { regex: /\\"slot\\":(\d+),\\"key\\":\\"([0-9a-f]{32})\\"/g, handler: offlineKey },
  { regex: /key = ([0-9a-f]{32});\s+loaded = \S+;\s+slot = (\d+)/g, handler: (_, k, s, o)=>offlineKey(_, s, k, o) },
  { regex: / <(1f8b[0-9a-f]{4} [ 0-9a-f]{800,})>/g, handler: handlFirmware },
  { regex: /"x-august-access-token" = "([a-zA-Z0-9\.]+)"/g, handler: handleJwt },
  { regex: /"password\\":\\"(.+)\\",\\"identifier\\":\\"(.+)\\",\\"installId\\":\\"([A-F0-9-]+)\\"/g, handler: handleLogin },
];
var previouslyLogged = {};
function offlineKey(_, slot, key, offset) {
  if(previouslyLogged[slot+key]) {
    return;
  }

  previouslyLogged[slot+key] = true;
  console.log('Offline Key: slot=' + slot + ' key=' + key);
}

function handleLogin(_, password, accountName, installId, offset) {
  if(previouslyLogged[accountName + password + installId]) {
    return;
  }

  previouslyLogged[accountName + password + installId] = true;
  console.log('User=' + accountName + ' Password=' + password + ' installId=' + installId);
}

function handleJwt(_, jwt, offset) {
  if(previouslyLogged[jwt]) {
    return;
  }
  previouslyLogged[jwt] = true;
  console.log('jwt:' + jwt);
}

function handlFirmware(_, firmware, offset) {
  firmware = firmware.replace(/\s+/g, '');
  var fwKey = firmware.substring(firmware.length-40, firmware.length-8);

  if(previouslyLogged[fwKey]) {
    return;
  }

  previouslyLogged[fwKey] = true;
  console.log('Firmware Key:' + fwKey);
}

function readFile(file) {
  return new Promise(function(resolve, reject) {
    fs.readFile(file, 'utf8', function(err, data){
      if(err) {
        return reject(new Error(err));
      }
      return resolve(data);
    });
  });
}

glob('../examples/logs/**/*.log', {}, async function (er, files) {
  for (var i = 0; i < files.length; i++) {
    console.log(files[i])
    var data = await readFile(files[i]);
    data = data.replace(/[\r\n]/g, ' ');
    for (var j = 0; j < matchers.length; j++) {
      var m = matchers[j];
      data.replace(m.regex, m.handler);
    }
  }
});
