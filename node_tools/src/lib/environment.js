const _ = require('lodash');
const Keychain = require('./keychain');
const hexify = require('./hexify');

var Environment = function Environment(environmentConfig) {
  this.rawConfig = environmentConfig;
}

var EnvironmentPrototype = function EnvironmentPrototype() {

  this.createKeychainForLock = function createKeychainForLock(lockId) {
    var lockIndex = _.findIndex(this.rawConfig.locks, { id:lockId })
    if(lockIndex < 0) {
      return;
    }

    var lock = this.rawConfig.locks[lockIndex];
    var keychain = new Keychain();
    keychain.preferedKeyId = lock.preferedKeyId;
    for (var i = lock.offlineKeys.length - 1; i >= 0; i--) {
      keychain.addOfflineKey('0f' + hexify(lock.offlineKeys[i].keySlot), lock.offlineKeys[i].key);
    }
    return keychain;
  }
}

Environment.prototype = new EnvironmentPrototype();

module.exports = Environment;
