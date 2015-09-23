var Parser = require('./esc/parser');
var Generator = require('./generator');
var CheerioEngine = require('./cheerio-engine');
var SheetEngine = require('./sheet-engine');
module.exports = VirtualPrinter;
function VirtualPrinter() {}

VirtualPrinter.prototype.cheerioElement = function(byteArray, options) {
  var engine = new CheerioEngine();
  var gen = new Generator(byteArray, engine)
  var esc = new Parser(gen);
  if (options && options.showBytes) {
    gen.eachByte(function(byte) {
      engine.write(' '+byte);
    });
  }
  return run(gen, esc, engine);
}

VirtualPrinter.prototype.sheets = function(byteArray) {
  var sheets = [[]];
  var engine = new SheetEngine(sheets);
  var gen = new Generator(byteArray, engine)
  var esc = new Parser(gen);
  var i = 0;
  var k = 0;
  gen.eachByte(function(byte) {
    sheets[i][k++] = byte;
  });
  gen.cut = function() {
    sheets[++i] = [];
    k = 0;
  }
  return run(gen, esc, engine);
}

function run(gen, esc, engine){
  while (gen.hasBytes()) esc.parse();
  return engine.export();
}
