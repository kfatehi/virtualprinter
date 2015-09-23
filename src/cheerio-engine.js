var cheerio = require('cheerio');

module.exports = function() {
  var $ = cheerio.load('');
  var container = $('<div>')
  var span = null;
  var y = null;
  var line = null;
  var spanStyle = {};
  var lineStyle = {};

  function startLine() {
    line = $('<p>').css(lineStyle);
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
      spanStyle['font-size'] = (n / 10)+'em'
      if (span) {
        endSpan();
        startSpan();
      }
    },
    alignLeft: function() {
      lineStyle['text-align'] = 'left';
    },
    alignCenter: function() {
      lineStyle['text-align'] = 'center';
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
      return container.css({
        'white-space': 'pre',
        'font-family': 'monospace'
      })
    }
  }
}
