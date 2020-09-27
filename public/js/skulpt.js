var skulpt = new function() {
  var self = this;
  self.debug = false; // if true, disable all browser caching in builtinread()
  
  // Run on page load
  this.init = function() {
    Sk.configure({
      output: self.outf,
      read: self.builtinRead,
      __future__: Sk.python3
    });
    Sk.execLimit = 5000;
  };

  // Run program
  this.runPython = function(prog) {
    if (typeof self.hardInterrupt != 'undefined') {
      delete self.hardInterrupt;
    }
    if (self.running == true) {
      return;
    }
    self.running = true;

    var myPromise = Sk.misceval.asyncToPromise(
      function() {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
      },
      {
        '*': self.interruptHandler
      }
    );
    var resetExecStart = setInterval(function(){Sk.execStart = Date();}, 2000);
    myPromise.then(
      function(mod) {
        self.running = false;
        clearInterval(resetExecStart);
        simPanel.setRunIcon('run');
      },
      function(err) {
        self.running = false;
        if (err instanceof Sk.builtin.ExternalError) {
          console.log(err.toString());
        } else {
          simPanel.consoleWriteErrors(err.toString());
        }
        clearInterval(resetExecStart);
        simPanel.setRunIcon('run');
      }
    );
  };

  // InterruptHandler
  this.interruptHandler = function (susp) {
    if (self.hardInterrupt === true) {
      delete self.hardInterrupt;
      throw new Sk.builtin.ExternalError('aborted execution');
    } else {
      return null;
    }
  };

  // Write to stdout
  this.outf = function (text) {
    simPanel.consoleWrite(text);
  }

  // File loader
  this.builtinRead = function (filename) {
    var externalLibs = {
      './ev3dev2/__init__.py': 'ev3dev2/__init__.py?v=1601171997',
      './ev3dev2/motor.py': 'ev3dev2/motor.py?v=1601171997',
      './ev3dev2/sound.py': 'ev3dev2/sound.py?v=1601171997',
      './ev3dev2/sensor/__init__.py': 'ev3dev2/sensor/__init__.py?v=1601171997',
      './ev3dev2/sensor/lego.py': 'ev3dev2/sensor/lego.py?v=1601171997',
      './ev3dev2/sensor/virtual.py': 'ev3dev2/sensor/virtual.py?v=1601171997',
      './ev3dev2/pen.py': 'ev3dev2/pen.py?v=1601171997',
      './simPython.js': 'js/simPython.js?v=1601171997'
    }
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
      if (filename in externalLibs) {
        fetchname = externalLibs[filename]
        if (self.debug) {
          nameparts = fetchname.split("?");
          ts = new Date();
          fetchname = nameparts[0] + "?v=" + ts.getTime().toString();
          console.log('skulpt loading file ', fetchname);
        }
        return Sk.misceval.promiseToSuspension(
          fetch(fetchname)
            .then(r => r.text())
        );
      } else {
        throw "File not found: '" + filename + "'";
      }
    }
    return Sk.builtinFiles["files"][filename];
  };
}

// Init class
skulpt.init();
