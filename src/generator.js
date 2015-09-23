var Generator = function(byteArray, engine){
  this.bytePosition = 0;
  this.byteArray = byteArray;
  this.engine = engine;
  this.setJustificationFlushLeft();
  this.setMasterSelectElite();
  this.engine.newLine();
}

Generator.prototype.newLine = function() {
  this.engine.newLine();
}

Generator.prototype.write = function(char) {
  this.engine.write(char);
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

Generator.prototype.selectCharacterSize = function(fontSize) {
  this.engine.setFont(fontSize);
}

Generator.prototype.setJustificationFlushLeft = function() {
  this.engine.alignLeft();
}

Generator.prototype.setJustificationCentering = function() {
  this.engine.alignCenter();
}

Generator.prototype.getByte = function() {
  return this.byteArray[this.bytePosition++];
}

Generator.prototype.getChar = function() {
  return String.fromCharCode(this.getByte());
}

Generator.prototype.peek = function(c) {
  var chars = [];
  for (var i=0; i<c; i++) {
    chars[i] = this.getByte();
  }
  this.bytePosition -= c;
  return chars;
}

Generator.prototype.hasBytes = function() {
  return this.bytePosition+1 < this.byteArray.length;
}

module.exports = Generator;
