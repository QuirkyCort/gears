var skulpt = new function() {
  var self = this;


  // Run on page load
  this.init = function() {
    Sk.configure({
      output: self.outf,
      read: self.builtinRead
    });
  };

  // Run program
  this.runPython = function() {
    var prog = pythonPanel.editor.getValue();

    var myPromise = Sk.misceval.asyncToPromise(
      function() {
        return Sk.importMainWithBody("<stdin>", false, prog, true);
      },
      {
        '*': self.interruptHandler
      }
    );
    myPromise.then(
      function(mod) {
        self.running = false;
      },
      function(err) {
        self.running = false;
        simPanel.consoleWriteErrors(err.toString());
        // sim.stopAnimation();
      }
    );
  };

  // InterruptHandler
  this.interruptHandler = function (susp) {
    if (Sk.hardInterrupt === true) {
      delete Sk.hardInterrupt;
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
      './ev3dev2/__init__.py': 'ev3dev2/__init__.py',
      './ev3dev2/motor.py': 'ev3dev2/motor.py',
      './ev3dev2/sensor/__init__.py': 'ev3dev2/sensor/__init__.py',
      './ev3dev2/sensor/lego.py': 'ev3dev2/sensor/lego.py',
      './simPython.js': 'js/simPython.js'
    }
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
      if (filename in externalLibs) {
        return Sk.misceval.promiseToSuspension(
          fetch(externalLibs[filename])
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
