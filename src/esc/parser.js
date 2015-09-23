var c = require('./constants');

module.exports = Parser;

function Parser(generator, options) {
  this.generator = generator;
  this.debug = !!(options || {}).debug;
}

Parser.prototype.invoke = function(prefix, suffix) {
  if (!prefix) throw new Error('Cannot invoke without a prefix');
  if (!suffix) throw new Error('Cannot invoke '+prefix+' without a suffix');
  var name = prefix+suffix;
  var fn = this.generator[name];
  if (!fn) throw new ReferenceError(name+' is not defined');
  return fn.bind(this.generator)();
}

Parser.prototype.selectCharacterSize = function() {
  var byte = this.generator.getByte();
  var size = c.CHARACTER_SIZE[byte];
  if (size.width === 1 && size.height === 1) {
    this.generator.selectCharacterSize(12);
  } else if (size.width === 2 && size.height === 1) {
    this.generator.selectCharacterSize(24);
  }
}

Parser.prototype.parse = function() {
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
          this.selectCharacterSize();
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
          this.invoke('setMasterSelect', c.MASTER_SELECT[gen.getByte()]);
          break;
        }
        case 'a':{
          this.invoke('setJustification', c.JUSTIFICATION[gen.getByte()]);
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
            gen.newLine();
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
          gen.selectBoldFont()
          break;
        }
        case 'p': {
          //console.log('Send pulse');
          break;
        }
        case '3': {
          // console.log('Some line spacing shit');
          break;
        }
        default: {
          console.warn('Unimplemented ESC '+char+' ('+byte+')')
          break; 
        }
      }
    }
    case c.CTL_LF: {
      gen.newLine();
      break;
    }
    default: {
      if (byte >= 32 && byte <= 126) {
        var char = String.fromCharCode(byte);
        gen.write(char)
      }
      break;
    }
  }
}
