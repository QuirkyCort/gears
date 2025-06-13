var filesManager = new function() {
  var self = this;

  this.unsaved = false;
  this.modified = false;

  this.files = {};

  // Run on page load
  this.init = function() {
    self.$filesList = $('#filesList');
    self.$addNewFile = $('#addNewFile');

    self.$addNewFile.click(self.addNewFile);

    self.loadLocalStorage();
    setInterval(self.saveLocalStorage, 2 * 1000);
  };

  // Load legacy
  this.loadLocalStorageLegacy = function() {
    let code = localStorage.getItem('pythonCode');
    if (code) {
      let files = {
        'main.py': code
      };
      localStorage.setItem('gearsPythonCode', JSON.stringify(files));
      localStorage.removeItem('pythonCode');
    }
    let modified = localStorage.getItem('pythonModified');
    if (modified) {
      localStorage.setItem('gearsPythonModified', modified);
      localStorage.removeItem('pythonModified');
    }
  };

  // Load from local storage
  this.loadLocalStorage = function() {
    self.loadLocalStorageLegacy();
    if (localStorage.getItem('gearsPythonModified') == 'true') {
      self.modified = true;
    }

    var json = localStorage.getItem('gearsPythonCode');
    if (json) {
      let files = JSON.parse(json);
      for (let filename in files) {
        self.add(filename, files[filename]);
      }
    } else {
      self.add('main.py', '');
    }
    self.select('main.py');
  };

  // Save to local storage
  this.saveLocalStorage = function() {
    if (self.unsaved) {
      self.unsaved = false;
      self.updateCurrentFile();
      localStorage.setItem('gearsPythonCode', JSON.stringify(self.files));
      localStorage.setItem('gearsPythonModified', self.modified);
    }
  };

  this.setToDefault = function() {
    self.files = {};
    self.$filesList.find('.file').remove();
    self.add('main.py', pythonPanel.editor.getValue());
    self.select('main.py');
  };

  this.updateCurrentFile = function() {
    let currentFilename = self.getCurrentFilename();
    if (currentFilename != '') {
      self.files[currentFilename] = pythonPanel.editor.getValue();
    }
  };

  this.getCurrentFilename = function() {
    let selected = self.$filesList.find('.selected')[0];
    return $(selected).find('.filename').text();
  };

  this.add = function(filename, content) {
    if (filename in self.files) {
      return;
    }
    self.updateCurrentFile();
    self.files[filename] = content;
    let $file = $(
      '<div class="file">' +
        '<div class="filename"></div>' +
      '</div>'
    );

    $file.click(function(ele) {
      self.updateCurrentFile();
      if (ele.target.classList.contains('file') || ele.target.classList.contains('filename')) {
        filename = ele.target.innerText;
        self.select(filename);
      }
    });

    if (filename != 'main.py') {
      $file.append('<div class="renameFile"><span class="icon-edit"></span></div>');
      $file.append('<div class="deleteFile"><span class="icon-deleteFile"></span></div>');
      $file.find('.renameFile').click(self.renameFileDialog);
      $file.find('.deleteFile').click(self.deleteFileDialog);
    }

    $file.find('.filename').text(filename);
    self.$filesList.append($file);

    self.select(filename);
  };

  this.deleteFileDialog = function(event) {
    let $file = $(event.target).parents('.file');
    let filename = $file.find('.filename').text();

    confirmDialog({
      title: 'Delete File?',
      message: 'Are you sure you want to delete "' + filename + '"? You cannot undo this.',
      confirm: 'Delete'
    }, function () {
      self.deleteFile(filename);
    })
  };

  this.deleteFile = function(filename) {
    delete self.files[filename];
    for (let file of self.$filesList.find('.file')) {
      if ($(file).find('.filename').text() == filename) {
        $(file).remove();
        break;
      }
    }
    self.unsaved = true;
    self.select('main.py');
  };

  this.deleteAll = function() {
    for (let f in self.files) {
      self.deleteFile(f);
    }
  }

  this.renameFileDialog = function(event) {
    let $file = $(event.target).parents('.file');
    let filename = $file.find('.filename').text();

    let $changeNameWindow = confirmDialog({
      title: 'Rename File',
      message: '<div>New name: <input id="newName" type="text" value="' + filename + '"></div>'
    }, function() {
      let newName = $changeNameWindow.$body.find('#newName').val();
      self.renameFile(filename, newName);
    })
  };

  this.renameFile = function(oldName, newName) {
    newName = newName.trim();
    if (newName == 'boot.py') {
      showErrorModal('"boot.py" is a reserved name. Choose a different name.');
    } else if (newName.slice(0, 5) == '_ioty') {
      showErrorModal('Filenames starting with "_ioty" are all reserved. Choose a different name.');
    } else {
      self.files[newName] = self.files[oldName];
      delete self.files[oldName];

      for (let file of self.$filesList.find('.file')) {
        let $filename = $(file).find('.filename');
        if ($filename.text() == oldName) {
          $filename.text(newName);
          break;
        }
      }
      self.unsaved = true;
      self.saveLocalStorage();
    }
  };

  this.select = function(filename) {
    pythonPanel.ignoreChange++;
    pythonPanel.editor.setValue(self.files[filename], 1);
    pythonPanel.ignoreChange--;

    for (let file of self.$filesList.find('.file')) {
      if ($(file).find('.filename').text() == filename) {
        $(file).addClass('selected');
      } else {
        $(file).removeClass('selected');
      }
    }
  };

  this.addNewFile = function() {
    let counter = 1;

    pythonPanel.warnModify();

    while (('untitled-' + counter + '.py') in self.files) {
      counter++;
    }

    self.add('untitled-' + counter + '.py', '');
  };
}

// Init class
filesManager.init();