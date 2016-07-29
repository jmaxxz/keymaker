module.exports = function(buffer) {
  this.flashContents = buffer.toString('hex', 4, 12);
}
