var cheerio = require('cheerio');

module.exports = function() {
  var $ = cheerio.load('');
  var container = $('<div>').css({
    whiteSpace: 'pre',
    fontFamily: 'monospace'
  });
  var span = null;
  var y = null;
  var line = null;
  var spanStyle = null;

  function startLine() {
    line = $('<p>');
  }

  function endLine() {
    if (line) container.append(line);
    line = null;
  }

  function startSpan() {
    span = $('<span>').css(spanStyle);
  }

  function endSpan() {
    if (span) line.append(span);
    span = null;
  }

  startLine();
  startSpan();

  return {
    setFont: function(n) {
      spanStyle = {
        'font-size': (n / 10)+'em'
      }
      if (span) {
        endSpan();
        startSpan();
      }
    },
    newLine: function() {
      endSpan();
      endLine();
      startLine();
      startSpan();
    },
    write: function(text) {
      span.text( span.text() + text )
    },
    export: function() {
      return container;
    }
  }
}
