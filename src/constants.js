module.exports = {
  ESC           : 0x1b,
  GS            : 0x1d,
  CTL_LF        : 0x0a,
  MASTER_SELECT : {
    0: 'Pica',
    1: 'Elite',
    2: 'Proportional',
    4: 'Condensed',
    8: 'Emphasized',
    16: 'DoubleStrike',
    32: 'DoubleWide',
    49: 'DoubleHeightDoubleWide',
    64: 'Italic',
    128: 'Underline'
  },
  CHARACTER_SIZE : {
    0:  { height: 1, width: 1 },
    16: { height: 1, width: 2 }
  },
  JUSTIFICATION : { // Page 78 escpos.pdf
    0: 'FlushLeft',
    1: 'Centering',
    2: 'FlushRight',
    3: 'Justified',
    get: function(int) {
      if (int >= 0 && int <= 3) return this[int];
      else if (int >= 48 && int <= 51) int -= 48;
      else throw new Error("Invalid justification: "+int);
      return this[int];
    }
  }
}
