var CanvasGenerator = require('./canvas-generator');
var FakeCanvas = require('./fake-canvas');
var EscposEmulator = require('./escpos-emulator');
module.exports = SheetExtractor;

function SheetExtractor() {}

SheetExtractor.prototype.extract = function(byteArray, done) {
  var fc = new FakeCanvas();
  fc.fillText = function(){}
  var generator = new CanvasGenerator(fc);
  var start = 0;
  var sheets = [[]];
  generator.setEmulator(EscposEmulator);
  var _getByte = generator.getByte.bind(generator);
  var i = 0;
  var k = 0;
  generator.getByte = function() {
    var byte = _getByte();
    sheets[i][k++] = byte;
    return byte;
  }
  generator.cut = function() {
    sheets[++i] = [];
    k = 0;
  }

  generator.generateFromUint8Array(byteArray, function() {
    for (var i=0; i<sheets.length; i++) {
      sheets[i] = new Buffer(sheets[i])
    }
    done(sheets);
  })
};
