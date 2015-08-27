/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var VirtualPrinter = __webpack_require__(1)

	var vp = new VirtualPrinter();

	/*
	 * AngularJS directive for rendering ESC data to an HTML5 canvas
	 */
	angular.module('virtualprinter', []).directive('escRender', function() {
	  return {
	    restrict: 'AE',
	    scope: {
	      receipt: '=',
	    },
	    link: function(scope, iElement, iAttrs, ctrl) {
	      var as = iAttrs.as;
	      var method = null;
	      if (as === 'html') {
	        method = 'generateHTMLFromByteArray'; 
	      } else if (as === 'canvas') {
	        method = 'analyzeAndGenerateCanvasFromByteArray';
	      } else if (as === 'debug') {
	        method = 'generateDebugHTMLFromByteArray';
	      } else {
	        throw new Error('Must specify attribute as=[html|canvas|debug]');
	      } 
	      scope.$watch('receipt.data.data', function(data) {
	        if (data) {
	          if (as === "canvas" && scope.receipt._dataURL) {
	            iElement.empty().append($('<img src="'+scope.receipt._dataURL+'">'));
	          } else {
	            vp[method](data, function(result) {
	              if (as === "canvas") {
	                scope.receipt._dataURL = result.toDataURL();
	                iElement.empty().append($('<img src="'+scope.receipt._dataURL+'">'));
	              } else {
	                iElement.empty().append(result);
	              }
	            });
	          }
	        }
	      }, true);
	    }
	  }
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var CanvasAnalyzer = __webpack_require__(2);
	var CanvasGenerator = __webpack_require__(3);
	var EscposEmulator = __webpack_require__(6);
	var HtmlGenerator = __webpack_require__(7);

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
	  new CanvasAnalyzer(this, { buffer: byteArray }).analyze(done);
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
	  new HtmlGenerator(this, { debug: true }).generate(byteArray, done);
	}

	VirtualPrinter.prototype.generateHTMLFromByteArray = function(byteArray, done) {
	  new HtmlGenerator(this).generate(byteArray, done);
	}

	module.exports = VirtualPrinter;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var CanvasGenerator = __webpack_require__(3);
	var FakeCanvas = __webpack_require__(5);
	var EscposEmulator = __webpack_require__(6);

	var CanvasAnalyzer = function(virtPrint, options) {
	  if (options.path) {
	    this.buffer = virtPrint.fs.readFileSync(options.path);
	  } else if (options.buffer) {
	    this.buffer = options.buffer
	  } else throw new Error('Options must include `path` or `buffer`')
	  this.dimensions = { height: 0, width: 0 };
	  this.generator = new CanvasGenerator( new FakeCanvas() );
	  this.generator.setEmulator(EscposEmulator);
	}

	CanvasAnalyzer.prototype.analyze = function(callback) {
	  var fontPadding = 5;
	  var xMax = 0;
	  var yMax = 0;
	  this.generator.generateFromUint8Array(this.buffer, function(fakeCanvas) {
	    fakeCanvas.actions.forEach(function(action) {
	      if (action.name === 'fillText') {
	        if (action.x > xMax) xMax = action.x + action.fontSize+fontPadding;
	        if (action.y > yMax) yMax = action.y + action.fontSize+fontPadding;
	      }
	    });
	    callback({
	      actions: fakeCanvas.actions,
	      width: Math.ceil(xMax),
	      height: Math.ceil(yMax)
	    })
	  })
	}

	module.exports = CanvasAnalyzer;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var c = __webpack_require__(4);

	var CanvasGenerator = function(canvas, height, width, debug){
	  this.debug = !!debug;
	  this.canvas = canvas || document.createElement('canvas');
	  this.context = this.canvas.getContext('2d');
	  this.setFont();
	  this.position = { x: 0, y: this.fontSize };
	  this.height = height || 600;
	  this.width = width || 300;
	  this.canvas.height = this.height;
	  this.canvas.width = this.width;
	  // fill white background
	  this.context.rect(0,0,this.width,this.height);
	  this.context.fillStyle="white";
	  this.context.fill();
	  // the text will be black
	  this.context.fillStyle = "black";
	}

	CanvasGenerator.prototype.dynamicInvoke = function(prefix, suffix) {
	  if (!prefix) throw new Error('Cannot dynamically invoke without a prefix');
	  if (!suffix) throw new Error('Cannot dynamically invoke '+prefix+' without a suffix');
	  var name = prefix+suffix;
	  var fn = this[name];
	  if (!fn) throw new ReferenceError(name+' is not defined');
	  return fn.bind(this)();
	}

	CanvasGenerator.prototype.setFont = function(size) {
	  this.fontSizeRatio = 0.6;
	  this.fontSize = size || 12;
	  this.context.font = this.fontSize+"px monospace";
	}

	CanvasGenerator.prototype.setJustification = function(byte) {
	  this.dynamicInvoke('setJustification', c.JUSTIFICATION.get(byte));
	}

	CanvasGenerator.prototype.setMasterSelect = function(byte) {
	  this.dynamicInvoke('setMasterSelect', c.MASTER_SELECT[byte]);
	}

	CanvasGenerator.prototype.setMasterSelectPica = function() {
	  this.setFont(16);
	}

	CanvasGenerator.prototype.setMasterSelectElite = function() {
	  this.setFont(12);
	}

	CanvasGenerator.prototype.setMasterSelectDoubleStrike = function() {
	  this.setFont(24);
	}

	CanvasGenerator.prototype.selectCharacterSize = function(byte) {
	  var size = c.CHARACTER_SIZE[byte];
	  if (size.width === 1 && size.height === 1) {
	    this.setFont(12);
	  } else if (size.width === 2 && size.height === 1) {
	    this.setFont(24);
	  }
	}

	CanvasGenerator.prototype.setJustificationFlushLeft = function() {
	  //this.justification = 'left';
	}

	CanvasGenerator.prototype.setJustificationCentering = function() {
	  //this.justification = 'center';
	}

	CanvasGenerator.prototype.getByte = function() {
	  var byte = this.byteArray[this.bytePosition++];
	  if (this.debug) {
	    this.context.fillText('{'+byte+'}', this.position.x, this.position.y);
	  }
	  return byte;
	}

	CanvasGenerator.prototype.getChar = function() {
	  return String.fromCharCode(this.getByte());
	}

	CanvasGenerator.prototype.peekChars = function(c) {
	  var chars = [];
	  for (var i=0; i<c; i++) {
	    var byte = this.getByte();
	    chars[i] = '"'+String.fromCharCode(byte)+'"/('+byte+')';
	  }
	  this.bytePosition -= c;
	  return chars;
	}

	CanvasGenerator.prototype.hasBytes = function() {
	  return this.bytePosition+1 < this.byteArray.length;
	}

	CanvasGenerator.prototype.setEmulator = function(klass) {
	  this.emulator = new klass(this, { debug: this.debug });
	}

	CanvasGenerator.prototype.generateFromUint8Array = function(byteArray, done) {
	  this.bytePosition = 0;
	  this.byteArray = byteArray;
	  while (this.hasBytes()) this.emulator.emulate();
	  done(this.canvas);
	}

	module.exports = CanvasGenerator;


/***/ },
/* 4 */
/***/ function(module, exports) {

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


/***/ },
/* 5 */
/***/ function(module, exports) {

	var FakeCanvas = function(opts){
	  opts = opts || {};
	  this.debug = opts.debug;
	  this.actions = [];
	}
	FakeCanvas.prototype.getContext = function() { return this }
	FakeCanvas.prototype.rect = function() {}
	FakeCanvas.prototype.fill = function() {}
	FakeCanvas.prototype.fillText = function(char, x, y) {
	  var font = this.font.split(' ');
	  this.actions.push({
	    name: 'fillText',
	    text: char,
	    canvasFont: this.font,
	    fontFamily: font[1],
	    fontUnit: 'px',
	    fontSize: parseFloat(font[0]),
	    x:x, y:y
	  })
	}
	module.exports = FakeCanvas;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var c = __webpack_require__(4);

	var EscposEmulator = function(generator, options) {
	  this.generator = generator;
	  this.debug = !!(options || {}).debug;
	  console.log('escpost debug', this.debug);
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
	              console.warn("Invalid ESC S %d command\n",ch);
	            break;
	          }
	        }
	        case '{': {
	          var byte = gen.getByte();
	          if (byte === 0) {
	            // right side up, no problem
	          } else {
	            console.warn("Unimplemented upside-down value "+String(byte));
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
	          console.log("Set horizontal motion index (HMI), page 106");
	          break;
	        }
	        case '$': {
	          console.log("Set absolute horizontal print position, page 38");
	          break;
	        }
	        case '2': {
	          console.log('Select 1/6th inch line spacing, page 60');
	          break;
	        }
	        case 'R': {
	          console.log('Select an international character set, page 87');
	          break;
	        }
	        case 't':{
	          console.log('Select character table, page 84');
	          break;
	        }
	        case 'J':{
	          console.log('Advance print position vertically, page 48');
	          break;
	        }
	        case 'M':{
	          console.log('Select 10.5pt 12cpi, page 109');
	          break;
	        }
	        case 'E':{
	          console.log('Select bold font, page 117');
	          break;
	        }
	        default: {
	          console.warn('Unimplemented ESC '+char+' ('+byte+') '+gen.peekChars(6).join(' '));
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


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var CustomGenerator = __webpack_require__(8);

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


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var CanvasGenerator = __webpack_require__(3);
	var FakeCanvas = __webpack_require__(5);
	var EscposEmulator = __webpack_require__(6);

	var CustomGenerator = function(virtPrint, options) {
	  this.debug = options.debug;
	  if (options.path) {
	    this.buffer = virtPrint.fs.readFileSync(options.path);
	  } else if (options.buffer) {
	    this.buffer = options.buffer
	  } else throw new Error('Options must include `path` or `buffer`')
	  this.dimensions = { height: 0, width: 0 };
	  this.generator = new CanvasGenerator( new FakeCanvas({ debug: this.debug }), null, null, this.debug);
	  this.generator.setEmulator(EscposEmulator);
	}

	CustomGenerator.prototype.work = function(process, done) {
	  this.generator.generateFromUint8Array(this.buffer, function(fakeCanvas) {
	    fakeCanvas.actions.forEach(process);
	    done()
	  })
	}

	module.exports = CustomGenerator;


/***/ }
/******/ ]);