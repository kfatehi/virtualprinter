var c = require('./constants');

var Generator = function(byteArray, engine, debug){
  this.bytePosition = 0;
  this.byteArray = byteArray;
  this.engine = engine;
  this.setMasterSelectElite();
  this.engine.newLine();
}

Generator.prototype.dynamicInvoke = function(prefix, suffix) {
  if (!prefix) throw new Error('Cannot dynamically invoke without a prefix');
  if (!suffix) throw new Error('Cannot dynamically invoke '+prefix+' without a suffix');
  var name = prefix+suffix;
  var fn = this[name];
  if (!fn) throw new ReferenceError(name+' is not defined');
  return fn.bind(this)();
}

Generator.prototype.newLine = function() {
  this.engine.newLine();
}

Generator.prototype.write = function(char) {
  this.engine.write(char);
}

Generator.prototype.setJustification = function(byte) {
  this.dynamicInvoke('setJustification', c.JUSTIFICATION.get(byte));
}

Generator.prototype.setMasterSelect = function(byte) {
  this.dynamicInvoke('setMasterSelect', c.MASTER_SELECT[byte]);
}

Generator.prototype.setMasterSelectPica = function() {
  this.engine.setFont(16);
}

Generator.prototype.setMasterSelectElite = function() {
  this.engine.setFont(12);
}

Generator.prototype.setMasterSelectDoubleStrike = function() {
  this.engine.setFont(24);
}

Generator.prototype.setMasterSelectDoubleHeightDoubleWide = function() {
  this.engine.setFont(32);
}

Generator.prototype.selectCharacterSize = function(byte) {
  var size = c.CHARACTER_SIZE[byte];
  if (size.width === 1 && size.height === 1) {
    this.engine.setFont(12);
  } else if (size.width === 2 && size.height === 1) {
    this.engine.setFont(24);
  }
}

Generator.prototype.setJustificationFlushLeft = function() {
  //this.justification = 'left';
}

Generator.prototype.setJustificationCentering = function() {
  //this.justification = 'center';
}

Generator.prototype.getByte = function() {
  var byte = this.byteArray[this.bytePosition++];
  if (this.debug) {
    this.context.fillText('{'+byte+'}', this.position.x, this.position.y);
  }
  return byte;
}

Generator.prototype.getChar = function() {
  return String.fromCharCode(this.getByte());
}

Generator.prototype.peekChars = function(c) {
  var chars = [];
  for (var i=0; i<c; i++) {
    var byte = this.getByte();
    chars[i] = '"'+String.fromCharCode(byte)+'"/('+byte+')';
  }
  this.bytePosition -= c;
  return chars;
}

Generator.prototype.hasBytes = function() {
  return this.bytePosition+1 < this.byteArray.length;
}

module.exports = Generator;
