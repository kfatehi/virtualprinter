var c = require('./constants');

CanvasGenerator = function(canvas, height, width, debug){
  this.debug = !!debug;
  this.canvas = canvas || document.createElement('canvas');
  this.context = this.canvas.getContext('2d');
  this.setFont();
  this.position = { x: 0, y: this.fontSize };
  this.height = height || 600;
  this.width = width || 300;
  this.canvas.height = this.height;
  this.canvas.width = this.width;
  // fill white background
  this.context.rect(0,0,this.width,this.height);
  this.context.fillStyle="white";
  this.context.fill();
  // the text will be black
  this.context.fillStyle = "black";
}

CanvasGenerator.prototype.dynamicInvoke = function(prefix, suffix) {
  if (!prefix) throw new Error('Cannot dynamically invoke without a prefix');
  if (!suffix) throw new Error('Cannot dynamically invoke '+prefix+' without a suffix');
  var name = prefix+suffix;
  var fn = this[name];
  if (!fn) throw new ReferenceError(name+' is not defined');
  return fn.bind(this)();
}

CanvasGenerator.prototype.setFont = function(size) {
  this.fontSizeRatio = 0.6;
  this.fontSize = size || 12;
  this.context.font = this.fontSize+"px monospace";
}

CanvasGenerator.prototype.setJustification = function(byte) {
  this.dynamicInvoke('setJustification', c.JUSTIFICATION.get(byte));
}

CanvasGenerator.prototype.setMasterSelect = function(byte) {
  this.dynamicInvoke('setMasterSelect', c.MASTER_SELECT[byte]);
}

CanvasGenerator.prototype.setMasterSelectPica = function() {
  this.setFont(16);
}

CanvasGenerator.prototype.setMasterSelectElite = function() {
  this.setFont(12);
}

CanvasGenerator.prototype.setMasterSelectDoubleStrike = function() {
  this.setFont(24);
}

CanvasGenerator.prototype.selectCharacterSize = function(byte) {
  var size = c.CHARACTER_SIZE[byte];
  if (size.width === 1 && size.height === 1) {
    this.setFont(12);
  } else if (size.width === 2 && size.height === 1) {
    this.setFont(24);
  }
}

CanvasGenerator.prototype.setJustificationFlushLeft = function() {
  //this.justification = 'left';
}

CanvasGenerator.prototype.setJustificationCentering = function() {
  //this.justification = 'center';
}

CanvasGenerator.prototype.getByte = function() {
  var byte = this.byteArray[this.bytePosition++];
  if (this.debug) {
    this.context.fillText('{'+byte+'}', this.position.x, this.position.y);
  }
  return byte;
}

CanvasGenerator.prototype.getChar = function() {
  return String.fromCharCode(this.getByte());
}

CanvasGenerator.prototype.peekChars = function(c) {
  var chars = [];
  for (var i=0; i<c; i++) {
    var byte = this.getByte();
    chars[i] = '"'+String.fromCharCode(byte)+'"/('+byte+')';
  }
  this.bytePosition -= c;
  return chars;
}

CanvasGenerator.prototype.hasBytes = function() {
  return this.bytePosition+1 < this.byteArray.length;
}

CanvasGenerator.prototype.setEmulator = function(klass) {
  this.emulator = new klass(this, { debug: this.debug });
}

CanvasGenerator.prototype.generateFromUint8Array = function(byteArray, done) {
  this.bytePosition = 0;
  this.byteArray = byteArray;
  while (this.hasBytes()) this.emulator.emulate();
  done(this.canvas);
}

module.exports = CanvasGenerator;
