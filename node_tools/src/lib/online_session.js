const RawMessage = require('./raw_message');
const cmd = require('./command_builder');
const SecCommand = require('./sec/sec_command');
const util = require('util');
const crypto = require('crypto');
const request = require('request');
const Keychain = require('./keychain');
const EventEmitter = require('events');
const Api = require('./rest/api');


var OnlineSession = function OnlineSession(lock, apiSession) {
  if(!lock.id || lock.id == ''){
    throw new Error('Invalid lock');
  }
  EventEmitter.call(this);
  this.lock = lock;
  this.sessionKeyPt1 = null;
  this.key = null;
  this.api = new Api(apiSession);
  this.keychain = new Keychain();
  this.connectionKeyId = '0f00';
  //lock.on('secUpdate', d=>this.decryptSec(d));
  //lock.on('mcuUpdate', d=>this.decryptMcu(d));
  // Delay the processing of the update in order to let passive
  // observers see the messages in the order they occur
}

var OnlineSessionPrototype = function OnlineSessionPrototype() {
  this.initComms2 = async function initComms2(data) {
    var secondHalfKey = new Buffer(8);
    var results = await this.api.getLockRands(this.lock.id, data);
    secondHalfKey.writeUInt32LE(results.lRand1, 0);
    secondHalfKey.writeUInt32LE(results.lRand2, 4);
    this.emit('secUpdate', cmd.sendSessionKeyPt2(secondHalfKey.toString('hex')).data + '0f00');

    this.key = this.sessionKeyPt1 + secondHalfKey.toString('hex');
    this.keychain.setSessionKey(this.key, this.connectionKeyId);
    this.lock.on('mcuUpdate', this.decryptMcu.bind(this));
    this.lock.on('secUpdate', this.decryptSec.bind(this));
    this.on('secUpdate', this.processSecUpdate.bind(this));
    await this.secWrite(cmd.finializeSessionKey().data);
  }

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
    try {
      await this.secWrite(cmd.disconnect().data);
    } finally {
      await this.lock.disconnect()
    }
  }

  this.processSecUpdate = async function processSecUpdate(data) {
    try {
      var cipherMsg = new RawMessage(data);
      var secCommand = new SecCommand(cipherMsg.data);
      switch(secCommand.commandAsInt) {
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
    var halfKey = crypto.randomBytes(8);
    this.sessionKeyPt1 = halfKey.toString('hex');
    var results = await this.api.initComms(this.lock.id, halfKey);
    this.emit('secWrite', cmd.sendSessionKey(this.sessionKeyPt1).addChecksum().data + '0f00');

    this.lock.once('secUpdate', this.initComms2.bind(this));
    await this.lock.secWrite(results.packet);
  }
}
OnlineSession.prototype = new OnlineSessionPrototype();
util.inherits(OnlineSessionPrototype, EventEmitter);

module.exports = OnlineSession;
