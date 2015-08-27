var CustomGenerator = require('./custom-generator');

var HtmlGenerator = function(virtPrint, opts) {
  this.virtPrint = virtPrint;
  this.$ = virtPrint.$ || window.$;
  this.debug = !!(opts || {}).debug;
};

HtmlGenerator.prototype.generate = function(byteArray, done) {
  var $ = this.$;
  var container = $('<div>').css({
    whiteSpace: 'pre',
    fontFamily: 'monospace'
  });
  var span = null;
  var y = null;
  var line = null;
  var fontSize = null;
  var startLine = function() {
    line = $('<p>');
  }
  var endLine = function() {
    if (line) container.append(line);
    line = null;
  }
  var startSpan = function(fontSize) {
    span = $('<span>').css({ 'font-size': fontSize });
  }
  var endSpan = function() {
    if (span) line.append(span);
    span = null;
  }

  new CustomGenerator(this.virtPrint, { debug: this.debug, buffer: byteArray }).work(function(action) {
    if (action.name === "fillText") {
      if (action.y != y) {
        endSpan()
        endLine()
        startLine()
        startSpan(action.fontSize);
        fontSize = action.fontSize;
        y = action.y
      }
      if (action.fontSize != fontSize) {
        endSpan()
        startSpan(action.fontSize)
        fontSize = action.fontSize;
      }
      //span.get(0).innerText+=action.text
      span.text( span.text() + action.text )
    }
  }, function() {
    endSpan()
    endLine()
    done(container);
  })
}

module.exports = HtmlGenerator;
