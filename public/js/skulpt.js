var skulpt = new function() {
  var self = this;

  this.externalLibs = {
    './ev3dev2/__init__.py': false,
    './ev3dev2/motor.py': 'ev3dev2/motor.py?v=d118b16a',
    './ev3dev2/sound.py': 'ev3dev2/sound.py?v=ec3085ff',
    './ev3dev2/button.py': 'ev3dev2/button.py?v=a7f892ad',
    './ev3dev2/sensor/__init__.py': 'ev3dev2/sensor/__init__.py?v=6d1f054c',
    './ev3dev2/sensor/lego.py': 'ev3dev2/sensor/lego.py?v=9fa3d991',
    './ev3dev2/sensor/virtual.py': 'ev3dev2/sensor/virtual.py?v=db93c480',
    './simPython.js': 'js/simPython.js?v=1b9bc620',
    './pybricks/__init__.py': false,
    './pybricks/parameters.py': 'pybricks/parameters.py?v=2db482b9',
    './pybricks/tools.py': 'pybricks/tools.py?v=20eafcfc',
    './pybricks/hubs.py': 'pybricks/hubs.py?v=7fa5cb11',
    './pybricks/ev3devices.py': 'pybricks/ev3devices.py?v=8ee63a93',
    './pybricks/robotics.py': 'pybricks/robotics.py?v=bf287d71',
    './ev3dev2/Training_Wheels.py': 'ev3dev2/Training_Wheels.py?v=ad06cf56',
  };
  this.preloadedLibs = {};

  // Run on page load
  this.init = function() {
    Sk.configure({
      output: self.outf,
      read: self.builtinRead,
      __future__: Sk.python3
    });
    Sk.execLimit = 5000;

    self.preload();
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
  };

  // Files preloader
  this.preload = function () {
    function fetchPreload(key, url){
      fetch(url)
        .then(function(r){
          return r.text();
        })
        .then(function(r){
          self.preloadedLibs[key] = r;
        });
    }

    for (key in self.externalLibs) {
      if (self.externalLibs[key] === false) {
        self.preloadedLibs[key] = '';
      } else {
        fetchPreload(key, self.externalLibs[key]);
      }
    }
  };

  // File loader
  this.builtinRead = function (filename) {
    let searchModule = filename;
    if (searchModule.startsWith('./')) {
      searchModule = searchModule.substring(2);
    }
    if (filesManager.files[searchModule] !== undefined) {
      return filesManager.files[searchModule];
    }

    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][filename] === undefined) {
      if (filename in self.preloadedLibs) {
        return self.preloadedLibs[filename];
      } else if (filename in self.externalLibs) {
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
