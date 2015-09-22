var Parser = require('./esc/parser');
var HTMLEngine = require('./html-engine');
var Generator = require('./generator');
//var SheetExtractor = require('./sheet-extractor');

var VirtualPrinter = function() {}

VirtualPrinter.prototype.generateDebugHTMLFromByteArray = function(byteArray, done) {
  new Generator(true).generate(byteArray, done);
}

VirtualPrinter.prototype.generateHTMLFromByteArray = function(byteArray, done) {
  var html = new HTMLEngine();
  var gen = new Generator(byteArray, html)
  var esc = new Parser(gen);
  while (gen.hasBytes()) esc.parse();
  done(html.export());
}

VirtualPrinter.prototype.getSheets = function(byteArray, done) {
  new SheetExtractor().extract(byteArray, done);
}

module.exports = VirtualPrinter;
