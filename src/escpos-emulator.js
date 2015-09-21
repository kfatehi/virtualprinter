var c = require('./constants');

var EscposEmulator = function(generator, options) {
  this.generator = generator;
  this.debug = !!(options || {}).debug;
}

EscposEmulator.prototype.emulate = function() {
  var gen = this.generator;
  var byte = gen.getByte();
  switch (byte) {
    case c.GS:{
      var byte = gen.getByte();
      var char = String.fromCharCode(byte);
      switch (char) {
        case 'L': { break; }
        case 'W': { break; }
        case '!':{
          gen.selectCharacterSize(gen.getByte());
          break;
        }
        case 'V': {
          var m = gen.getByte();
          if (m === 0 || m === 48) { // "A"
            //console.log('Full cut');
          } else if (m === 1 || m === 49) { // "A"
            //console.log('Partial cut');
          } else if (m === 65) { // "B"
            var n = gen.getByte();
          } else if (m === 66) { // "B"
            var n = gen.getByte();
          } else if (m === 97) { // "C"
            var n = gen.getByte();
          } else if (m === 98) { // "C"
            var n = gen.getByte();
          } else if (m === 103) { // "D"
            var n = gen.getByte();
          } else if (m === 104) { // "D"
            var n = gen.getByte();
          }
          if (gen.cut) gen.cut();
          break;
        }
      }
      break;
    }
    case c.ESC:{
      var byte = gen.getByte();
      var char = String.fromCharCode(byte);
      switch (char) {
        case '!':{
          gen.setMasterSelect(gen.getByte());
          break;
        }
        case 'a':{
          gen.setJustification(gen.getByte());
          break;
        }
        case 'S':{
          var ch = gen.getByte();
          switch(ch) {
            case 0:
            case '0':
              gen.setScriptMode('superscript')
            break;
            case 1:
            case '1':
              gen.setScriptMode('subscript')
            break;
            default:
              //console.warn("Invalid ESC S %d command\n",ch);
            break;
          }
        }
        case '{': {
          var byte = gen.getByte();
          if (byte === 0) {
            // right side up, no problem
          } else {
            //console.warn("Unimplemented upside-down value "+String(byte));
          }
          break;
        }
        case '@': {
          // console.log("initalize printer (exit graphics mode), page 205");
          // we can pretty much ignore this one until we implement graphics mode
          break;
        }
        case 'd': {
          var linesToFeed = gen.getByte();
          for (var i=0; i<linesToFeed; i++) {
            gen.position.y += gen.fontSize;
            gen.position.x = 0;
          }
          break;
        }
        case '=': { break; } /* ESC = is nonrecommended */
        case 'c': {
          //console.log("Set horizontal motion index (HMI), page 106");
          break;
        }
        case '$': {
          //console.log("Set absolute horizontal print position, page 38");
          break;
        }
        case '2': {
          //console.log('Select 1/6th inch line spacing, page 60');
          break;
        }
        case 'R': {
          //console.log('Select an international character set, page 87');
          break;
        }
        case 't':{
          //console.log('Select character table, page 84');
          break;
        }
        case 'J':{
          //console.log('Advance print position vertically, page 48');
          break;
        }
        case 'M':{
          //console.log('Select 10.5pt 12cpi, page 109');
          break;
        }
        case 'E':{
          //console.log('Select bold font, page 117');
          break;
        }
        case 'p': {
          //console.log('Send pulse');
          break;
        }
        default: {
          console.warn('Unimplemented ESC '+char+' ('+byte+')')
          break; 
        }
      }
    }
    case c.CTL_LF: {
      gen.position.y += gen.fontSize;
      gen.position.x = 0;
      break;
    }
    default: {
      if (byte >= 32 && byte <= 126) {
        var char = String.fromCharCode(byte);
        gen.context.fillText(char, gen.position.x, gen.position.y);
        gen.position.x+=gen.fontSize * gen.fontSizeRatio;        
      }
      break;
    }
  }
}

module.exports = EscposEmulator;
