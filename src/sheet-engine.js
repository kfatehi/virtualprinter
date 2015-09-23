module.exports = function(sheets) {
  return {
    alignLeft: function() {},
    alignCenter: function() {},
    setFont: function() {},
    newLine: function() {},
    write: function() {},
    export: function() {
      for (var i=0; i<sheets.length; i++) {
        sheets[i] = new Buffer(sheets[i])
      }
      return sheets;
    }
  }
}
