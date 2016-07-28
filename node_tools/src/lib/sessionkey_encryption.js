const crypto = require('crypto');

var SessionkeyEncryption = function SessionkeyEncryption(encryptionKey) {
  this.key = encryptionKey;
  this._decryptor = {};
  this._encryptor = {};
  this.reset();
};

var SessionkeyEncryptionPrototype = function SessionkeyEncryptionPrototype() {
  var createDecryptor = function createDecryptor(key) {
    if(typeof(key) == 'string')
      key = new Buffer(key, 'hex');
    var decryptor = crypto.createDecipheriv('aes-128-cbc', key, new Buffer('00000000000000000000000000000000', 'hex'));
    decryptor.setAutoPadding(false);
    return decryptor;
  }

  var createEncryptor = function createEncryptor(key) {
    if(typeof(key) == 'string')
      key = new Buffer(key, 'hex');
    var encryptor = crypto.createCipheriv('aes-128-cbc', key, new Buffer('00000000000000000000000000000000', 'hex'));
    encryptor.setAutoPadding(false);
    return encryptor;
  }

  this.encrypt = function encrypt(data) {
    if(typeof(data) == 'string')
      data = new Buffer(data, 'hex');
    if(data.length != 16) throw { data:data, message: 'All known august messages are 128bits long.' };
    return this._encryptor.update(data).toString('hex');
  }

  this.decrypt = function decrypt(data) {
    if(typeof(data) == 'string')
      data = new Buffer(data, 'hex');
    if(data.length != 16) throw { data:data, message: 'All known august messages are 128bits long.'};
    return this._decryptor.update(data).toString('hex');
  }

  this.reset = function reset() {
    this._decryptor = createDecryptor(this.key);
    this._encryptor = createEncryptor(this.key);
  }
}

SessionkeyEncryption.prototype = new SessionkeyEncryptionPrototype();

module.exports = SessionkeyEncryption;
