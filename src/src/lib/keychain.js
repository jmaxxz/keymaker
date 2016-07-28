const OfflineEncryption = require('./offlinekey_encryption');
const SessionEncryption = require('./sessionkey_encryption');

var Keychain = function Keychain() {
  this.offlineKeychain = {};
  // Default session encryptors to null encryption keys
  this.session = new OfflineEncryption('00000000000000000000000000000000');
  this.secSession = new OfflineEncryption('00000000000000000000000000000000');
  this.secSessionId = null;
  this.preferedKeyId = null;
}

var KeychainPrototype = function KeychainPrototype() {
  this.getEncryptor = function getEncryptor(keyId){
    return this.secSessionId == keyId
      ? this.secSession
      : this.offlineKeychain[keyId] || this.session;
  }

  this.removeOfflineKey = function removeOfflineKey(keyId) {
    delete offlineKeychain[keyId];
  }

  this.addOfflineKey = function addOfflineKey(keyId, key) {
    if(this.preferedKeyId === null) {
      this.preferedKeyId = keyId;
    }
    this.offlineKeychain[keyId] = new SessionEncryption(key);
  }

  this.setSessionKey = function setSessionKey(key, keyId) {
    this.session = new SessionEncryption(key);
    this.secSessionId = keyId;
    this.secSession = new SessionEncryption(key);
  }

  this.resetStream = function resetStream() {
    this.session.reset();
    this.secSession.reset();
  }

  this.decrypt = function decrypt(data, keyId) {
    var decryptor = this.getEncryptor(keyId);
    return decryptor.decrypt(data).toString('hex') + keyId;
  }

  this.encrypt = function encrypt(data, keyId) {
    var encryptor = this.getEncryptor(keyId);
    return encryptor.encrypt(data).toString('hex') + keyId;
  }
}
Keychain.prototype = new KeychainPrototype();
module.exports = Keychain;
