var CanvasGenerator = require('./canvas-generator');
var FakeCanvas = require('./fake-canvas');

var CustomGenerator = function(options) {
  if (options.path) {
    this.buffer = require('fs').readFileSync(options.path);
  } else if (options.buffer) {
    this.buffer = options.buffer
  } else throw new Error('Options must include `path` or `buffer`')
  this.dimensions = { height: 0, width: 0 };
  this.generator = new CanvasGenerator( new FakeCanvas() );
  this.generator.setEmulator(EscposEmulator);
}

CustomGenerator.prototype.work = function(process, done) {
  this.generator.generateFromUint8Array(this.buffer, function(fakeCanvas) {
    fakeCanvas.actions.forEach(process);
    done()
  })
}

module.exports = CustomGenerator;
