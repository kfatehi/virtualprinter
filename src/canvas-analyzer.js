var CanvasGenerator = require('./canvas-generator');
var FakeCanvas = require('./fake-canvas');

CanvasAnalyzer = function(options) {
  if (options.path) {
    this.buffer = require('fs').readFileSync(options.path);
  } else if (options.buffer) {
    this.buffer = options.buffer
  } else throw new Error('Options must include `path` or `buffer`')
  this.dimensions = { height: 0, width: 0 };
  this.generator = new CanvasGenerator( new FakeCanvas() );
  this.generator.setEmulator(EscposEmulator);
}

CanvasAnalyzer.prototype.analyze = function(callback) {
  var fontPadding = 5;
  var xMax = 0;
  var yMax = 0;
  this.generator.generateFromUint8Array(this.buffer, function(fakeCanvas) {
    fakeCanvas.actions.forEach(function(action) {
      if (action.name === 'fillText') {
        if (action.x > xMax) xMax = action.x + action.fontSize+fontPadding;
        if (action.y > yMax) yMax = action.y + action.fontSize+fontPadding;
      }
    });
    callback({
      actions: fakeCanvas.actions,
      width: Math.ceil(xMax),
      height: Math.ceil(yMax)
    })
  })
}

module.exports = CanvasAnalyzer;
