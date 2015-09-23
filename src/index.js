var Parser = require('./esc/parser');
var Generator = require('./generator');
var CheerioEngine = require('./cheerio-engine');
var SheetEngine = require('./sheet-engine');

var VirtualPrinter = function() {}

VirtualPrinter.prototype.run = function(gen, esc, engine){
  while (gen.hasBytes()) esc.parse();
  return engine.export();
}

VirtualPrinter.prototype.cheerioElement = function(byteArray, options) {
  var engine = new CheerioEngine();
  var gen = new Generator(byteArray, engine)
  var esc = new Parser(gen);
  if (options && options.showBytes) {
    var _getByte = gen.getByte.bind(gen);
    gen.getByte = function() {
      var byte = _getByte();
      engine.write(' '+byte)
      return byte;
    }
  }
  return this.run(gen, esc, engine);
}

VirtualPrinter.prototype.sheets = function(byteArray) {
  var sheets = [[]];
  var engine = new SheetEngine(sheets);
  var gen = new Generator(byteArray, engine)
  var esc = new Parser(gen);
  var _getByte = gen.getByte.bind(gen);
  var i = 0;
  var k = 0;
  gen.getByte = function() {
    var byte = _getByte();
    sheets[i][k++] = byte;
    return byte;
  }
  gen.cut = function() {
    sheets[++i] = [];
    k = 0;
  }
  return this.run(gen, esc, engine);
}

module.exports = VirtualPrinter;
