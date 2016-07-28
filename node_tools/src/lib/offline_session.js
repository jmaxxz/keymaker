const RawMessage = require('./raw_message');
const cmd = require('./command_builder');
const SecCommand = require('./sec/sec_command');
const util = require('util');
const crypto = require('crypto');
const EventEmitter = require('events');

var OfflineSession = function(lock, keychain, connectionKeyId) {
  EventEmitter.call(this);
  this.lock = lock;
  this.keychain = keychain;
  this.connectionKeyId = connectionKeyId || keychain.preferedKeyId;
  this.sessionKeyPt1 = null;
  this.key = null;
  lock.on('secUpdate', d=>this.decryptSec(d));
  lock.on('mcuUpdate', d=>this.decryptMcu(d));
  // Delay the processing of the update in order to let passive
  // observers see the messages in the order they occur
  // if we did not do this responses trigger events prior
  // to the requests that caused them.
  this.on('secUpdate', d=>setImmediate(()=>this.processSecUpdate(d)));
}

var OfflineSessionPrototype = function OfflineSessionPrototype() {
  this.decryptSec = function decryptSec(data) {
    var cipherMsg = new RawMessage(data);
    this.emit('secUpdate', this.keychain.decrypt(cipherMsg.data, cipherMsg.keyId));
  }

  this.decryptMcu = function decryptMcu(data) {
    var cipherMsg = new RawMessage(data);
    this.emit('mcuUpdate', this.keychain.decrypt(cipherMsg.data, cipherMsg.keyId));
  }

  this.secWrite = async function secWrite(data, keyId) {
    keyId = keyId || this.connectionKeyId;
    this.emit('secWrite', data+keyId);
    await this.lock.secWrite(this.keychain.encrypt(data, keyId));
  }

  this.mcuWrite = async function mcuWrite(data, keyId) {
    keyId = keyId || '0200';
    this.emit('mcuWrite', data+keyId);
    await this.lock.mcuWrite(this.keychain.encrypt(data, keyId));
  }

  this.disconnect = async function disconnect() {
    await this.lock.disconnect()
  }

  this.processSecUpdate = async function processSecUpdate(data) {
    try {
      var cipherMsg = new RawMessage(data);
      var secCommand = new SecCommand(cipherMsg.data);
      switch(secCommand.commandAsByte) {
        case 2:
          this.key = this.sessionKeyPt1 + secCommand.parameter1 + secCommand.parameter2;
          this.keychain.setSessionKey(this.key, cipherMsg.keyId);
          await this.secWrite(cmd.finializeSessionKey().data, cipherMsg.keyId);
        break;

        case 4:
          this.keychain.resetStream();
          this.emit('established');
        break;
      }
    } catch(e) {
      this.emit('error', e);
    }
  }

  this.establish = async function() {
    this.sessionKeyPt1 = crypto.randomBytes(8).toString('hex');
    return await this.secWrite(cmd.sendSessionKey(this.sessionKeyPt1).addChecksum().data, this.connectionKeyId);
  }
}

util.inherits(OfflineSessionPrototype, EventEmitter);
OfflineSession.prototype = new OfflineSessionPrototype();
module.exports = OfflineSession;
