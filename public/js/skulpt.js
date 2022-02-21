var skulpt = new function() {
  var self = this;

  this.externalLibs = {
    './ev3dev2/__init__.py': false,
    './ev3dev2/motor.py': 'ev3dev2/motor.py?v=f13c634c',
    './ev3dev2/sound.py': 'ev3dev2/sound.py?v=ec3085ff',
    './ev3dev2/button.py': 'ev3dev2/button.py?v=a7f892ad',
    './ev3dev2/sensor/__init__.py': 'ev3dev2/sensor/__init__.py?v=6d1f054c',
    './ev3dev2/sensor/lego.py': 'ev3dev2/sensor/lego.py?v=64cc5ea0',
    './ev3dev2/sensor/virtual.py': 'ev3dev2/sensor/virtual.py?v=bba8d7d8',
    './simPython.js': 'js/simPython.js?v=e4249484',
    './pybricks/__init__.py': false,
    './pybricks/parameters.py': 'pybricks/parameters.py?v=2db482b9',
    './pybricks/tools.py': 'pybricks/tools.py?v=20eafcfc',
    './pybricks/hubs.py': 'pybricks/hubs.py?v=10641eef',
    './pybricks/ev3devices.py': 'pybricks/ev3devices.py?v=c20c5c68',
    './pybricks/robotics.py': 'pybricks/robotics.py?v=bf287d71',
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
    // before import, check if this is one of the library tab modules
    searchModule = filename.replace(/.py/, '');
    if (searchModule.startsWith('./')) {
      // strip off the ./ , because we don't have it in the dict
      searchModule = searchModule.substring(2);
    }
    if (typeof pythonLibPanelFactory !== 'undefined') {
      for (var moduleID in pythonLibPanelFactory.pyModuleId2Panel) {
        panel = pythonLibPanelFactory.pyModuleId2Panel[moduleID];
        moduleName = panel.moduleName;
        if (searchModule == moduleName) {
          var code = panel.editor.getValue()
          console.log('importing lib code from', moduleName)
          console.log(code)
          return code
        }
      }
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
