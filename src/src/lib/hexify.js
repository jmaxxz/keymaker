const map = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
var hexify = function hexify(byte) {
  return map[(byte>>4) & 0x0f] + map[byte & 0x0f]
}

module.exports = hexify;
