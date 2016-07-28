var RawMessage = function RawMessage(rawMessage) {
  if(typeof(rawMessage) != 'string') {
    rawMessage = rawMessage.toString('hex');
  }
  this.keyId = null;

  if(rawMessage.length >= 36){
    this.keyId = rawMessage.substring(32, 36);
  }
  this.data = rawMessage.substring(0,32);
  this.raw = rawMessage;
}

module.exports = RawMessage;
