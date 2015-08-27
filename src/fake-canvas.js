var FakeCanvas = function(opts){
  opts = opts || {};
  this.debug = opts.debug;
  this.actions = [];
}
FakeCanvas.prototype.getContext = function() { return this }
FakeCanvas.prototype.rect = function() {}
FakeCanvas.prototype.fill = function() {}
FakeCanvas.prototype.fillText = function(char, x, y) {
  var font = this.font.split(' ');
  this.actions.push({
    name: 'fillText',
    text: char,
    canvasFont: this.font,
    fontFamily: font[1],
    fontUnit: 'px',
    fontSize: parseFloat(font[0]),
    x:x, y:y
  })
}
module.exports = FakeCanvas;
