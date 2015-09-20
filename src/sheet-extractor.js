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
  var sheets = [];
  generator.setEmulator(EscposEmulator);
  generator.cut = function() {
    sheets.push({
      start: start,
      end: generator.bytePosition
    });
    start = generator.bytePosition+1
  }

  generator.generateFromUint8Array(byteArray, function() {
    var slices = [];
    for (var i=0; i<sheets.length; i++) {
      var sheet = sheets[i];
      slices.push(byteArray.slice(sheet.start, sheet.end));
    }
    done(slices);
  })
};
