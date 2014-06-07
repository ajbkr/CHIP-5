define('chip5', [], function() {
  'use strict';

  var x1 = function(x) {
    return ('0' + x.toString(16)).slice(-1).toUpperCase();
  };

  var x2 = function(x) {
    return ('00' + x.toString(16)).slice(-2).toUpperCase();
  };

  var x3 = function(x) {
    return ('000' + x.toString(16)).slice(-3).toUpperCase();
  };

  var x4 = function(x) {
    return ('0000' + x.toString(16)).slice(-4).toUpperCase();
  };

  var Disassembler = function() {};

  Disassembler.prototype.instructions = [
    function(instruction) {	// 0x00
      switch (instruction) {
       case 0x00e0:
        return 'CLS';
       case 0x00ee:
        return 'RET';
       default:
        return 'SYS #' + x3(instruction & 0x0fff);
      }
    },

    function(instruction) {	// 0x01
      var mmm = instruction & 0x0fff;

      return 'JP #' + x3(mmm);
    },

    function(instruction) {	// 0x02
      var mmm = instruction & 0x0fff;

      return 'CALL #' + x3(mmm);
    },

    function(instruction) {	// 0x03
      var x  = (instruction >>> 8) & 0x0f,
          kk =  instruction        & 0xff;

      return 'SE V' + x1(x) + ',#' + x2(kk);
    },

    function(instruction) {	// 0x04
      var x  = (instruction >>> 8) & 0x0f,
          kk =  instruction        & 0xff;

      return 'SNE V' + x1(x) + ',#' + x2(kk);
    },

    function(instruction) {	// 0x05
      var x = (instruction >>> 8) & 0x0f,
          y = (instruction >>> 4) & 0x0f;

      return 'SE V' + x1(x) + ',V' + x1(y);
    },

    function(instruction) {	// 0x06
      var x  = (instruction >>> 8) & 0x0f,
          kk =  instruction        & 0xff;

      return 'LD V' + x1(x) + ',#' + x2(kk);
    },

    function(instruction) {	// 0x07
      var x  = (instruction >>> 8) & 0x0f,
          kk =  instruction        & 0xff;

      return 'ADD V' + x1(x) + ',#' + x2(kk);
    },

    function(instruction) {	// 0x08
      var x = (instruction >>> 8) & 0x0f,
          y = (instruction >>> 4) & 0x0f;

      switch (instruction & 0x0f) {
       case 0x00:
        return 'LD V'   + x1(x) + ',V' + x1(y);
       case 0x01:
        return 'OR V'   + x1(x) + ',V' + x1(y);
       case 0x02:
        return 'AND V'  + x1(x) + ',V' + x1(y);
       case 0x03:
        return 'XOR V'  + x1(x) + ',V' + x1(y);
       case 0x04:
        return 'ADD V'  + x1(x) + ',V' + x1(y);
       case 0x05:
        return 'SUB V'  + x1(x) + ',V' + x1(y);
       case 0x06:
        return 'SHR V'  + x1(x) + ',V' + x1(y);
       case 0x07:
        return 'SUBN V' + x1(x) + ',V' + x1(y);
       case 0x0e:
        return 'SHL V'  + x1(x) + ',V' + x1(y);
       default:
        throw('Invalid instruction: ' + x4(instruction));
      }
    },

    function(instruction) {	// 0x09
      var x = (instruction >>> 8) & 0x0f,
          y = (instruction >>> 4) & 0x0f;

      return 'SNE V' + x1(x) + ',V' + x1(y);
    },

    function(instruction) {	// 0x0a
      return 'LD I,#' + x3(instruction & 0x0fff);
    },

    function(instruction) {	// 0x0b
      var mmm = instruction & 0x0fff;

      return 'JP V0,#' + x3(mmm);
    },

    function(instruction) {	// 0x0c
      var x  = (instruction >>> 8) & 0x0f,
          kk =  instruction        & 0xff;

      return 'RND V' + x1(x) + ',#' + x2(kk);
    },

    function(instruction) {	// 0x0d
      var x = (instruction >>> 8) & 0x0f,
          y = (instruction >>> 4) & 0x0f,
          n =  instruction        & 0x0f;

      return 'DRW V' + x1(x) + ',V' + x1(y) + ',#' + x1(n);
    },

    function(instruction) {	// 0x0e
      var x = (instruction >>> 8) & 0x0f;

      switch (instruction & 0xff) {
       case 0x9e:
        return 'SKP V'  + x1(x);
       case 0xa1:
        return 'SKNP V' + x1(x);
       default:
        throw('Invalid instruction: ' + x4(instruction));
      }
    },

    function(instruction) {	// 0x0f
      var x = (instruction >>> 8) & 0x0f;

      switch (instruction & 0xff) {
       case 0x07:
        return 'LD V'     + x1(x) + ',DT';
       case 0x0a:
        return 'LD V'     + x1(x) + ',K';
       case 0x15:
        return 'LD DT,V'  + x1(x);
       case 0x18:
        return 'LD ST,V'  + x1(x);
       case 0x1e:
        return 'ADD I,V'  + x1(x);
       case 0x29:
        return 'LD F,V'   + x1(x);
       case 0x33:
        return 'LD B,V'   + x1(x);
       case 0x55:
        return 'LD [I],V' + x1(x);
       case 0x65:
        return 'LD V'     + x1(x) + ',[I]';
       default:
        throw('Invalid instruction: ' + x4(instruction));
      }
    }
  ];

  Disassembler.prototype.disassemble = function(instruction) {
    return this.instructions[(instruction >>> 12) & 0x0f](instruction);
  };

  var Interpreter = function() {
    this.canvas = this.context = this.hiddenCanvas = this.hiddenContext =
     this.imagedata = this.data = null;
    this.i = this.pc = this.sp = null;
    this.ram = [];
    this.stack = [];
    this.v = [];
    this.key = [];
    this.keyPressed = false;
    this.halt = this.dt = null;
    this.audioContext = this.input = null;
    this.timeout = undefined;

    // 123C 1234
    // 456D QWER
    // 789E ASDF
    // A0BF ZXCV
    var qwertyKeypad = {
      '88': 0,
      '49': 1,
      '50': 2,
      '51': 3,
      '81': 4,
      '87': 5,
      '69': 6,
      '65': 7,
      '83': 8,
      '68': 9,
      '90': 10,
      '67': 11,
      '52': 12,
      '82': 13,
      '70': 14,
      '86': 15
    };
    this.keypad = qwertyKeypad;

    for (var n = 0; n < 4096; ++n) {
      this.ram[n] = 0;
    }

    ////////////////

    var canvas = document.createElement('canvas');

    canvas.width  = 64 * 10;
    canvas.height = 32 * 10;

    this.canvas = canvas;

    var context = canvas.getContext('2d');

    context.imageSmoothingEnabled        =
     context.mozImageSmoothingEnabled    =
     context.msImageSmoothingEnabled     =
     context.webkitImageSmoothingEnabled = false;

    this.context = context;

    document.body.appendChild(canvas);

    var hiddenCanvas = document.createElement('canvas');

    hiddenCanvas.width  = 64;
    hiddenCanvas.height = 32;

    this.hiddenCanvas = hiddenCanvas;

    this.hiddenContext = hiddenCanvas.getContext('2d');

    this.audioContext = new webkitAudioContext();	// XXX webkit?!

    var input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'block';

    var that = this;
    input.addEventListener('change', function(e) {
      var files = e.target.files;

      if (files.length === 1) {
        var reader = new FileReader();

        reader.onload = function(e) {
          var array = new Uint8Array(e.target.result);

          for (n = 0; n < array.length; ++n) {
            that.ram[0x0200 + n] = array[n];
          }
          that.reset();
        };

        reader.readAsArrayBuffer(files[0]);
      }
    }, false);

    document.body.appendChild(input);

    var table = document.createElement('table');
    table.style.fontFamily = 'monospace';
    var tbody = document.createElement('tbody');

////
    var tr = document.createElement('tr');

    var td = document.createElement('td');

    td.appendChild(document.createTextNode('Instr.'));
    tr.appendChild(td);

    td = document.createElement('td');
    td.id = 'instruction';
    td.style.textAlign = 'right';
    td.style.width = '128px';

    td.appendChild(document.createTextNode(''));
    tr.appendChild(td);

    tbody.appendChild(tr);

////
    var tr = document.createElement('tr');

    var td = document.createElement('td');

    td.appendChild(document.createTextNode(''));
    tr.appendChild(td);

    td = document.createElement('td');
    td.id = 'mnemonic';
    td.style.textAlign = 'right';
    td.style.width = '128px';

    td.appendChild(document.createTextNode(''));
    tr.appendChild(td);

    tbody.appendChild(tr);

////
    tr = document.createElement('tr');

    td = document.createElement('td');

    td.appendChild(document.createTextNode('PC'));
    tr.appendChild(td);

    td = document.createElement('td');
    td.id = 'pc';
    td.style.textAlign = 'right';
    td.style.width = '128px';

    td.appendChild(document.createTextNode(''));
    tr.appendChild(td);

    tbody.appendChild(tr);

////
    tr = document.createElement('tr');

    td = document.createElement('td');

    td.appendChild(document.createTextNode('I'));
    tr.appendChild(td);

    td = document.createElement('td');
    td.id = 'i';
    td.style.textAlign = 'right';

    td.appendChild(document.createTextNode(''));
    tr.appendChild(td);

    tbody.appendChild(tr);

////
    tr = document.createElement('tr');

    td = document.createElement('td');

    td.appendChild(document.createTextNode('SP'));
    tr.appendChild(td);

    td = document.createElement('td');
    td.id = 'sp';
    td.style.textAlign = 'right';

    td.appendChild(document.createTextNode(''));
    tr.appendChild(td);

    tbody.appendChild(tr);

////
    for (var n = 0; n < 16; ++n) {
        tr = document.createElement('tr');

        td = document.createElement('td');

        td.appendChild(document.createTextNode('V' + n.toString(16)
          .toUpperCase()));
        tr.appendChild(td);

        td = document.createElement('td');
        td.id = 'v' + n.toString(16);
        td.style.textAlign = 'right';

        td.appendChild(document.createTextNode(''));
        tr.appendChild(td);

        tbody.appendChild(tr);
    }

    table.appendChild(tbody);

    document.body.appendChild(table);

    document.addEventListener('keypress', function(e) {
      switch (e.which) {
       case 53:		// (5)eset
        if (typeof that.timeout !== 'undefined') {
          that.halt = true;
          window.clearTimeout(that.timeout);
          that.timeout = undefined;
        }
        that.reset();
        break;
       case 103:	// (g)o
        that.halt = false;
        that.go();
        break;
       case 116:	// (t)race
        if (typeof that.timeout !== 'undefined') {
          that.halt = true;
          window.clearTimeout(that.timeout);
          that.timeout = undefined;
        }
        that.halt = false;
        that.trace();
        break;
      }
    }, false);

    document.addEventListener('keydown', function(e) {
      if (e.which in that.keypad) {
        that.key[that.keypad[e.which]] = true;
      }
    }, false);

    document.addEventListener('keyup', function(e) {
      if (e.which in that.keypad) {
        that.key[that.keypad[e.which]] = false;
        that.keyPressed = that.keypad[e.which];
      }
    }, false);

    this.reset();
  };

  Interpreter.prototype.instructions = [
    function(instruction) {	// 0x00
      switch (instruction) {
       case 0x00e0:
        // 00E0 Erase display (all 0's)
        this.hiddenContext.fillStyle = '#000';
        this.hiddenContext.fillRect(0, 0, this.hiddenCanvas.width,
         this.hiddenCanvas.height);
        this.imagedata = this.hiddenContext.getImageData(0, 0,
         this.hiddenCanvas.width, this.hiddenCanvas.height);
        this.data = this.imagedata.data;

        this.context.drawImage(this.hiddenCanvas, 0, 0, this.hiddenCanvas.width,
         this.hiddenCanvas.height, 0, 0, this.canvas.width, this.canvas.height);
        break;
       case 0x00ee:
        // 00EE Return from subroutine
        this.pc = this.stack[this.sp++];
        break;
       default:
        // 0MMM Do machine language subroutine at 0MMM
        this.halt = true;	// N/A
        break;
      }
    },

    function(instruction) {	// 0x01
      // 1MMM Go to 0MMM
      var mmm = instruction & 0x0fff;

      if (mmm == this.pc - 2) {
        this.halt = true;
      }
      this.pc = mmm;
    },

    function(instruction) {	// 0x02
      // 2MMM Do subroutine at 0MMM
      var mmm = instruction & 0x0fff;

      this.stack[--this.sp] = this.pc;
      this.pc = mmm;
    },

    function(instruction) {	// 0x03
      // 3XKK Skip next instruction if VX = KK
      var x  = (instruction >>> 8) & 0x0f,
          kk =  instruction        & 0xff;

      if (this.v[x] == kk) {
        this.pc += 2;
      }
    },

    function(instruction) {	// 0x04
      // 4XKK Skip next instruction if VX n.e. KK
      var x  = (instruction >>> 8) & 0x0f,
          kk =  instruction        & 0xff;

      if (this.v[x] != kk) {
        this.pc += 2;
      }
    },

    function(instruction) {	// 0x05
      // 5XY0 Skip next instruction if VX = VY
      var x = (instruction >>> 8) & 0x0f,
          y = (instruction >>> 4) & 0x0f;

      if (this.v[x] == this.v[y]) {
        this.pc += 2;
      }
    },

    function(instruction) {	// 0x06
      // 6XKK Let VX = KK
      var x  = (instruction >>> 8) & 0x0f,
          kk =  instruction        & 0xff;

      this.v[x] = kk;
    },

    function(instruction) {	// 0x07
      // 7XKK Let VX = VX + KK
      var x  = (instruction >>> 8) & 0x0f,
          kk =  instruction        & 0xff;

      this.v[x] = (this.v[x] + kk) & 0xff;
    },

    function(instruction) {	// 0x08
      var x = (instruction >>> 8) & 0x0f,
          y = (instruction >>> 4) & 0x0f;

      switch (instruction & 0x0f) {
       case 0x00:
        // 8XY0 Let VX = VY
        this.v[x] = this.v[y];
        break;
       case 0x01:
        // 8XY1 Let VX = VX | VY (VF changed)
        this.v[x] |= this.v[y];
        break;
       case 0x02:
        // 8XY2 Let VX = VX & VY (VF changed)
        this.v[x] &= this.v[y];
        break;
       case 0x03:
        // 8XY3 Let VX = VX ^ VY (VF changed)
        this.v[x] ^= this.v[y];
        break;
       case 0x04:
        // 8XY4 Let VX = VX + VY (VF = 00 if VX + VY l.e. FF,
        //   VF = 01 if VX + VY > FF)
        this.v[0x0f] = (this.v[x] + this.v[y] <= 0xff) ? (0) : (1);
        this.v[x] = (this.v[x] + this.v[y]) & 0xff;
        break;
       case 0x05:
        // 8XY5 Let VX = VX - VY (VF = 00 if VX < VY,
        //   VF = 01 if VX - VY g.e. VY)
        this.v[0x0f] = (this.v[x] < this.v[y]) ? (0) : (1);
        this.v[x] = (this.v[x] - this.v[y]) & 0xff;
        break;
       case 0x06:
        // 8XY6 Let VX = VY >>> 1 (VF = LSB of VY prior to SHR)
        this.v[0x0f] = this.v[y] & 0x01;
        this.v[x] = (this.v[y] >>> 1);
        break;
       case 0x07:
        // 8XY7 Let VX = VY - VX (VF = 00 if VX < VY,
        //   VF = 01 if VX - VY g.e. VY)
        this.v[0x0f] = (this.v[y] < this.v[x]) ? (0) : (1);
        this.v[x] = (this.v[y] - this.v[x]) & 0xff;
        break;
       case 0x0e:
        // 8XYE Let VX = VY << 1 (VF = MSB of VY prior to SHL)
        this.v[0x0f] = (this.v[y] & 0x80) ? (1) : (0);
        this.v[x] = (this.v[y] << 1) & 0xff;
        break;
       default:
        throw('Invalid instruction: ' + x4(instruction));
        break;
      }
    },

    function(instruction) {	// 0x09
      // 9XY0 Skip next instruction if VX n.e. VY
      var x = (instruction >>> 8) & 0x0f,
          y = (instruction >>> 4) & 0x0f;

      if (this.v[x] != this.v[y]) {
        this.pc += 2;
      }
    },

    function(instruction) {	// 0x0a
      // AMMM Let I = 0MMM
      this.i = instruction & 0x0fff;
    },

    function(instruction) {	// 0x0b
      // BMMM Go to 0MMM + V0
      this.pc = ((instruction & 0x0fff) + this.v[0]) & 0x0fff;
    },

    function(instruction) {	// 0x0c
      // CXKK Let VX = Random Byte (KK = Mask)
      var x  = (instruction >>> 8) & 0x0f,
          kk =  instruction        & 0xff;

      this.v[x] = (Math.random() * 255 | 0) & kk;
    },

    function(instruction) {	// 0x0d
      // DXYN Show n-byte MI pattern at VX-VY coordinates
      //   I unchanged. MI pattern is combined with existing display
      //   via EXCLUSIVE-OR function.
      //   VF = 01 if a 1 in MI pattern matches 1 in existing display.
      var x = (instruction >>> 8) & 0x0f,
          y = (instruction >>> 4) & 0x0f,
          n =  instruction        & 0x0f;

      if (this.v[x] < 0 || this.v[x] > 63 || this.v[y] < 0 || this.v[y] > 31) {
        return;	// XXX
      }

      this.v[0x0f] = 0;

      for (var y2 = 0; y2 < n; ++y2) {
        var bitmap = this.ram[this.i + y2];

        for (var x2 = 0; x2 < 8; ++x2) {
          if (bitmap & (0x80 >>> x2)) {
            var index = ((this.v[y] + y2) * this.hiddenCanvas.width +
             (this.v[x] + x2) & 0x07ff) << 2;

            if (this.data[index] != 0 || this.data[index + 1] != 0 ||
             this.data[index + 2] != 0 || this.data[index + 3] != 0xff) {
              this.v[0x0f] = 1;
            }

            this.data[index    ] ^= 0xff;
            this.data[index + 1] ^= 0xff;
            this.data[index + 2] ^= 0xff;
            this.data[index + 3]  = 0xff;
          }
        }
      }

      this.hiddenContext.putImageData(this.imagedata, 0, 0);

      this.context.drawImage(this.hiddenCanvas, 0, 0, this.hiddenCanvas.width,
       this.hiddenCanvas.height, 0, 0, this.canvas.width, this.canvas.height);
    },

    function(instruction) {	// 0x0e
      var x = (instruction >>> 8) & 0x0f;

      switch (instruction & 0xff) {
       case 0x9e:
        // EX9E Skip next instruction if VX = Hex key (LSD)
        if (this.key[this.v[x] & 0x0f]) {
          this.pc += 2;
        }
        break;
       case 0xa1:
        // EXA1 Skip next instruction if VX n.e. Hex key (LSD)
        if ( !this.key[this.v[x] & 0x0f]) {
          this.pc += 2;
        }
        break;
       default:
        throw('Invalid instruction: ' + x4(instruction));
        break;
      }
    },

    function(instruction) {	// 0x0f
      var x = (instruction >>> 8) & 0x0f;

      switch (instruction & 0xff) {
       case 0x07:
        // FX07 Let VX = current timer value
        this.v[x] = this.dt;
        break;
       case 0x0a:
        // FX0A Let VX = hex key digit (waits for any key pressed)
        if (this.keyPressed === false) {
          this.pc -= 2;
        } else {
          this.v[x] = this.keyPressed;
          this.keyPressed = false;
        }
        break;
       case 0x15:
        // FX15 Set timer = VX (01 = 1/60 second)
        this.dt = this.v[x];
        break;
       case 0x18:
        // FX18 Set tone duration = VX (01 = 1/60 second)
        var oscillator = this.audioContext.createOscillator();
        oscillator.type = 0;
        oscillator.frequency.value = 400;
        oscillator.connect(this.audioContext.destination);
        oscillator.noteOn(0);
        oscillator.noteOff(this.audioContext.currentTime +
         (1 / 60 * this.v[x]));
        break;
       case 0x1e:
        // FX1E Let I = I + VX
        this.i = (this.i + this.v[x]) & 0x0fff;
        break;
       case 0x29:
        // FX29 Let I = 5-byte display pattern for LSD of VX
        var xlat = [
          0x0130, 0x0139, 0x0122, 0x012a,
          0x013e, 0x0120, 0x0124, 0x0134,
          0x0126, 0x0128, 0x012e, 0x0118,
          0x0114, 0x011c, 0x0110, 0x0112
        ];
        this.i = xlat[this.v[x] & 0x0f];
        break;
       case 0x33:
        // FX33 Let MI = 3-decimal digit equivalent of VX
        //   (I unchanged)
        this.ram[this.i    ] = Math.floor(this.v[x] / 100);
        this.ram[this.i + 1] = Math.floor(this.v[x] / 10) % 10;
        this.ram[this.i + 2] = (this.v[x] % 100) % 10;
        break;
       case 0x55:
        // FX55 Let MI = V0:VX (I = I + X + 1)
        for (var n = 0; n <= x; ++n) {
          this.ram[(this.i + n) & 0x07ff] = this.v[n];
        }
        this.i += x + 1;
        break;
       case 0x65:
        // FX65 Let V0: VX MI (I = I + X + 1)
        for (n = 0; n <= x; ++n) {
          this.v[n] = this.ram[(this.i + n) & 0x07ff];
        }
        this.i += x + 1;
        break;
       default:
        throw('Invalid instruction: ' + x4(instruction));
        break;
      }
    }
  ];

  Interpreter.prototype.execute = function(instruction) {
    this.instructions[(instruction >>> 12) & 0x0f].call(this, instruction);
  };

  Interpreter.prototype.fetch = function() {
    var instruction = this.peek();

    this.pc += 2;
    return instruction;
  };

  Interpreter.prototype.go = function() {
    var that = this;

    if (typeof this.timeout !== 'undefined') {
      return;
    }

    (function do_go() {
      var tick = 0;

      if ( !that.halt) {
//        while (tick++ < 1) {
        while (tick++ < 13 /* ~COSMAC VIP */) {
//        while (tick++ < 97) {
//        while (tick++ < 66653 /* 4MHz */) {
          that.execute(that.fetch());
        }
        that.update(that.peek());

        if (that.dt > 0) {
          --that.dt;
        }

        that.timeout = window.setTimeout(do_go, 1000 / 60);
      }
    })();
  };

  Interpreter.prototype.peek = function() {
    var hi = this.ram[this.pc    ] & 0xff,
        lo = this.ram[this.pc + 1] & 0xff;

    return (hi << 8) | lo;
  };

  Interpreter.prototype.reset = function() {
    this.i = 0;
    this.pc = 0x0200;
    this.sp = 12;

    this.dt = 0;

    for (var n = 0; n < 16; ++n) {
      this.v[n] = 0;
    }

    for (n = 0; n < 12; ++n) {
      this.stack[n] = 0;
    }

    for (n = 0; n < 16; ++n) {
      this.key[n] = false;
    }

    this.halt = true;

    this.hiddenContext.fillStyle = '#000';
    this.hiddenContext.fillRect(0, 0, this.hiddenCanvas.width,
     this.hiddenCanvas.height);
    this.imagedata = this.hiddenContext.getImageData(0, 0,
     this.hiddenCanvas.width, this.hiddenCanvas.height);
    this.data = this.imagedata.data;

    this.context.drawImage(this.hiddenCanvas, 0, 0, this.hiddenCanvas.width,
     this.hiddenCanvas.height, 0, 0, this.canvas.width, this.canvas.height);

    // font
    var ram = this.ram;
    ram[0x0110] = 0xf0;
    ram[0x0111] = 0x80;
    ram[0x0112] = 0xf0;
    ram[0x0113] = 0x80;
    ram[0x0114] = 0xf0;
    ram[0x0115] = 0x80;
    ram[0x0116] = 0x80;
    ram[0x0117] = 0x80;
    ram[0x0118] = 0xf0;
    ram[0x0119] = 0x50;
    ram[0x011a] = 0x70;
    ram[0x011b] = 0x50;
    ram[0x011c] = 0xf0;
    ram[0x011d] = 0x50;
    ram[0x011e] = 0x50;
    ram[0x011f] = 0x50;
    ram[0x0120] = 0xf0;
    ram[0x0121] = 0x80;
    ram[0x0122] = 0xf0;
    ram[0x0123] = 0x10;
    ram[0x0124] = 0xf0;
    ram[0x0125] = 0x80;
    ram[0x0126] = 0xf0;
    ram[0x0127] = 0x90;
    ram[0x0128] = 0xf0;
    ram[0x0129] = 0x90;
    ram[0x012a] = 0xf0;
    ram[0x012b] = 0x10;
    ram[0x012c] = 0xf0;
    ram[0x012d] = 0x10;
    ram[0x012e] = 0xf0;
    ram[0x012f] = 0x90;
    ram[0x0130] = 0xf0;
    ram[0x0131] = 0x90;
    ram[0x0132] = 0x90;
    ram[0x0133] = 0x90;
    ram[0x0134] = 0xf0;
    ram[0x0135] = 0x10;
    ram[0x0136] = 0x10;
    ram[0x0137] = 0x10;
    ram[0x0138] = 0x10;
    ram[0x0139] = 0x60;
    ram[0x013a] = 0x20;
    ram[0x013b] = 0x20;
    ram[0x013c] = 0x20;
    ram[0x013d] = 0x70;
    ram[0x013e] = 0xa0;
    ram[0x013f] = 0xa0;
    ram[0x0140] = 0xf0;
    ram[0x0141] = 0x20;
    ram[0x0142] = 0x20;
    this.ram = ram;	// XXX req'd?!

    this.update(this.peek());
  };

  Interpreter.prototype.trace = function() {
    if ( !this.halt) {
      this.execute(this.fetch());
      this.update(this.peek());
    }
  };

  Interpreter.prototype.update = function(instruction) {
    var el = function(id) { return document.getElementById(id) || {}; };

    el('instruction').innerHTML = x4(instruction);
    el(   'mnemonic').innerHTML = (new Disassembler()).disassemble(
     instruction);
    el(         'pc').innerHTML = x4(this.pc);
    el(          'i').innerHTML = x4(this.i);
    el(         'sp').innerHTML = x2(this.sp);

    for (var n = 0; n < 16; ++n) {
      el('v' + x1(n).toLowerCase()).innerHTML = x2(this.v[n]) + ' (' +
       ('___' + this.v[n]).slice(-3) + ')';
    }
  };

  return {
    Disassembler: Disassembler,
    Interpreter:  Interpreter
  };
});
