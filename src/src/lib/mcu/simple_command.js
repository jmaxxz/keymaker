module.exports = function(name) {
  return function(buffer, start) {
    this.commandName = name;
  }
}
