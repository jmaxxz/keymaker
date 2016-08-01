const delay = require('./delay');
const EventEmitter = require('events');
const util = require('util');

/*
TODO: Update for new lock version which
has different service ids. (not yet released)

bd4ac6100b4511e38ffd0800200c9a66
  bd4ac6110b4511e38ffd0800200c9a66 (MCU Write)
    properties  writeWithoutResponse, write
  bd4ac6120b4511e38ffd0800200c9a66 (MCU Indicate)
    properties  read, indicate
    value       000000000000000000000000000000000000 | ''
  bd4ac6130b4511e38ffd0800200c9a66 (SEC Write)
    properties  write
  bd4ac6140b4511e38ffd0800200c9a66 (SEC Indicate)
    properties  indicate
*/
const mcuWriteId    = 'bd4ac6110b4511e38ffd0800200c9a66';
const mcuWriteId2   = 'e295c55169d011e4b116123b93f75cba';

const mcuReadId     = 'bd4ac6120b4511e38ffd0800200c9a66';
const mcuReadId2    = 'e295c55269d011e4b116123b93f75cba';

const secWriteId    = 'bd4ac6130b4511e38ffd0800200c9a66';
const secWriteId2   = 'e295c55369d011e4b116123b93f75cba';

const secIndicateId = 'bd4ac6140b4511e38ffd0800200c9a66';
const secIndicateId2 = 'e295c55469d011e4b116123b93f75cba';

var Lock = function Lock(peripheral) {
  EventEmitter.call(this);
  this.peripheral = peripheral;
  peripheral.on('warning', d=>this.emit('warning'));
  peripheral.on('disconnect', d=>this.emit('disconnect'));
  this.characteristics = {};
  this.name = peripheral.advertisement.localName;
  this.btId = peripheral.id;
  this.address = peripheral.address;
  this.id = peripheral.advertisement.manufacturerData.toString('hex', 4, 20).toUpperCase();
};



function LockPrototype(){
  this.discover = function discover() {
    return new Promise((resolve, reject)=>{
      if(this.characteristics[secWriteId]){
        // lock has been previously discovered
        resolve();
      }

      this.peripheral.discoverServices(['e295c55169d011e4b116123b93f75cba', 'bd4ac6100b4511e38ffd0800200c9a66'], (err, services)=>{
        if(err) reject(err);
        if(services.length == 0) reject('Missing services');

        services.forEach((service)=>{
          service.discoverCharacteristics([mcuWriteId, mcuReadId, secWriteId, secIndicateId], (err, characteristics)=>{
            if(err) reject(err);
            if(characteristics.length == 0) reject('Missing characteristics');

            characteristics.forEach((c)=>{
              switch (c.uuid){
                case mcuWriteId2:
                case mcuWriteId:
                  this.characteristics[mcuWriteId] = c;
                  break;
                case mcuReadId2:
                case mcuReadId:
                  this.characteristics[mcuReadId] = c;
                  break;
                case secWriteId2:
                case secWriteId:
                  this.characteristics[secWriteId] = c;
                  break;
                case secIndicateId2:
                case secIndicateId:
                  this.characteristics[secIndicateId] = c;
                  break;
                default:
                  reject('Unexpected characteristic ' + c);
              }
            });
            resolve();
          });
        });
      });
    });
  }

  this.mcuNotify = async function mcuNotify(enabled) {
    await characteristicNotify(this.characteristics[mcuReadId], enabled);
    this.characteristics[mcuReadId].on('data', d=>this.emit('mcuUpdate', d));
  }

  this.secNotify = async function secNotify(enabled) {
    await characteristicNotify(this.characteristics[secIndicateId], enabled);
    this.characteristics[secIndicateId].on('data', d=>this.emit('secUpdate', d));
  }

  this.mcuWrite = async function mcuWrite(data, notify) {
    if(notify === undefined) notify = true;
    if(typeof(data) == 'string')
      data = new Buffer(data, 'hex');
    return await dataCharacteristic(this.characteristics[mcuWriteId], data, notify);
  }

  this.secWrite = async function secWrite(data, notify) {
    if(notify === undefined) notify = true;
    if(typeof(data) == 'string')
      data = new Buffer(data, 'hex');
    return await dataCharacteristic(this.characteristics[secWriteId], data, notify);
  }

  this.disconnect = async function disconnect() {
    await this.peripheral.disconnect()
  }

  function characteristicNotify(characteristic, enabled) {
    return new Promise((resolve, reject)=>{
      characteristic.notify(enabled, (error)=>{
        if(error) reject(error);
        resolve();
      });
    });
  }

  function dataCharacteristic(characteristic, data, notify) {
    return new Promise((resolve, reject)=>{
      characteristic.write(data, notify, (error)=>{
        if(error) return reject(error);
        delay(200).then(()=>resolve());
      });
    });
  }
}

util.inherits(LockPrototype, EventEmitter);
Lock.prototype = new LockPrototype();


module.exports = Lock;
