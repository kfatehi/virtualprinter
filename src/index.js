var CanvasAnalyzer = require('./canvas-analyzer');
var CanvasGenerator = require('./canvas-generator');
var EscposEmulator = require('./escpos-emulator');
var HtmlGenerator = require('./html-generator');

var VirtualPrinter = function() {}

function fetchBinaryData(binURL, cb) {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", binURL, true);
  oReq.responseType = "arraybuffer";
  oReq.onload = function (oEvent) {
    var arrayBuffer = oReq.response;
    if (arrayBuffer) return cb(new Uint8Array(arrayBuffer));
  };
  oReq.send(null);
}

function string2ArrayBuffer(string, callback) {
  var blob = new Blob([string]);
  var f = new FileReader();
  f.onload = function(e) {
    callback(new Uint8Array(e.target.result));
  }
  f.readAsArrayBuffer(blob);
}

VirtualPrinter.prototype.printFromBinaryURL = function(url, done) {
  fetchBinaryData(url, function(byteArray) {
    this.generateFromByteArray(byteArray, done);
  }.bind(this));
}

VirtualPrinter.prototype.printFromString = function(string, done) {
  string2ArrayBuffer(string, function(byteArray) {
    this.analyzeAndGenerateFromByteArray(byteArray, done);
  }.bind(this))
}


VirtualPrinter.prototype.analyzeAndGenerateCanvasFromByteArray = function(byteArray, done) {
  this.analyzeFromByteArray(byteArray, function(analysis) {
    this.generateFromByteArray(byteArray, analysis, done);
  }.bind(this));
}

VirtualPrinter.prototype.analyzeFromByteArray = function(byteArray, done) {
  new CanvasAnalyzer({ buffer: byteArray }).analyze(done);
}

VirtualPrinter.prototype.generateFromByteArray = function(byteArray, analysis, done) {
  var generator = null;
  if (typeof analysis === "object") {
    generator = new CanvasGenerator(null, analysis.height, analysis.width);
  } else {
    generator = new CanvasGenerator();
  }
  generator.setEmulator(EscposEmulator);
  generator.generateFromUint8Array(byteArray, done);
}

VirtualPrinter.prototype.showHidden = function(string) {
  var gen = new DebugStringGenerator();
  return gen.generateStringFromString(string);
}

VirtualPrinter.prototype.generateDebugHTMLFromByteArray = function(byteArray, done) {
  new HtmlGenerator({ debug: true }).generate(byteArray, done);
}

VirtualPrinter.prototype.generateHTMLFromByteArray = function(byteArray, done) {
  new HtmlGenerator().generate(byteArray, done);
}

module.exports = VirtualPrinter;
