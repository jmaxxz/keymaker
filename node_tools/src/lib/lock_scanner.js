const noble = require('noble');
const util = require('util');
const delay = require('./delay');
const EventEmitter = require('events');
const Lock = require('./lock');

function LockScanner() {
  EventEmitter.call(this);

  this.start = function start(){
    noble.on('stateChange', function(state) {
      if (state === 'poweredOn') {
        noble.startScanning(["bd4ac6100b4511e38ffd0800200c9a66"], false);
      } else {
        noble.stopScanning();
      }
    });

    noble.on('discover', async peripheral => {
      // things seem pretty unstable if one starts looking
      // at the peripheral immediately.
      await delay(500);
      if(!peripheral.advertisement.manufacturerData || peripheral.advertisement.manufacturerData.length < 20) {
        return;
      }
      peripheral.connect(async (err)=>{
        if(err){
          this.emit('error', err);
          return;
        }

        try {
          var lock = new Lock(peripheral);
          if(!lock.id) {
            await peripheral.disconnect();
            return;
          }
          await lock.discover();
          await lock.secNotify(true);
          await lock.mcuNotify(true);
          this.emit('lockFound', lock);
        } catch (e){
          this.emit('error', e);
        }
      });
    });
  }
}
util.inherits(LockScanner, EventEmitter);

module.exports = new LockScanner;
