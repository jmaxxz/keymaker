function Constraint(){
  this.isByte = (value, name)=>{
    this.isInt(value, name);
    this.isBetweenInclusive(0, 255);
  }

  this.isNumber = (value, name)=>{
    var valueType = typeof(value);
    if(valueType !== 'number') {
      throw new Error('expected ' + name + ' to be an number, but it was a ' + valueType + ' (' + value + ')');
    }
  }

  this.isOfLength = (value, name, length)=>{
    if(value.length != length) {
      throw new Error('expected ' + name + ' to be ' + length + ' long, but it was a ' + value.length + ' (' + value + ')');
    }
  }

  this.isInt = (value, name) => {
    this.isNumber(value, name);
    if(~~value !== value){
      throw new Error('expected ' + name + ' to be a whole number, but it was ' + value);
    }
  }

  this.isUInt = (value, name) => {
    this.isInt(value, name);
    if(value < 0) {
      throw new Error('expected ' + ' to be a positive whole number, but it was ' + value);
    }
  }

  this.isUInt16 = (value, name) => {
    this.isUInt16(value, name);
    if((value&0xFFFF) !== value){
      throw new Error('expected ' + name + ' to be a 16bit number, but it was ' + value);
    }
  }

  this.isUInt32 = (value, name) => {
    this.isUInt(value, name);
    if((value&0xFFFFFFFF) !== value){
      throw new Error('expected ' + name + ' to be a 32bit number, but it was ' + value);
    }
  }

  this.isInt32 = (value, name) => {
    this.isInt(value, name);
    if((value&0xFFFFFFFF) !== value){
      throw new Error('expected ' + name + ' to be a 32bit number, but it was ' + value);
    }
  }

  this.isBetweenInclusive = (value, name, inclusiveMin, exclusiveMax)=> {
    this.isNumber(value, name);
    if(value < inclusiveMin) {
      throw new Error('expected ' + name + ' to be >=' + inclusiveMin + ' but was ' + value);
    }

    if(value > exclusiveMax){
      throw new Error('expected ' + name + ' to be <=' + exclusiveMax + ' but was ' + value);
    }
  }
}

module.exports = new Constraint();
