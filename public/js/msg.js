const MSGS = {
  '#blk-motion': {
    en: 'Motion',
    tlh: 'mo\'Qoq',
    es: 'Movimiento',
    fr: 'Mouvement',
  },
  '#blk-motor': {
    en: 'Motor',
    tlh: 'nguSDI\'',
  },
  '#blk-sensors': {
    en: 'Sensors',
    tlh: 'ghe\'\'or',
  },
  '#blk-sound': {
    en: 'Sound',
    tlh: 'wab',
  },
  '#blk-control': {
    en: 'Control',
    tlh: 'SeH',
  },
  '#blk-logic': {
    en: 'Logic',
    tlh: 'wanl\'',
  },
  '#blk-loops': {
    en: 'Loops',
    tlh: 'QoQ',
  },
  '#blk-math': {
    en: 'Math',
    tlh: 'ma\'rIch',
  },
  '#blk-text': {
    en: 'Text',
    tlh: 'wej',
  },
  '#blk-lists': {
    en: 'Lists',
    tlh: 'tlhegh',
  },
  '#blk-variables': {
    en: 'Variables',
    tlh: 'qeylIS',
  },
  '#blk-functions': {
    en: 'Functions',
    tlh: 'tlhaw\'DIyuS',
  },
  '#blk-when_started': {
    en: 'When Started',
  },
  '#main-blocks': {
    en: 'Blocks',
    tlh: 'Porgh',
  },
  '#main-sim': {
    en: 'Simulator',
    tlh: 'ghertlhuD'
  },
  '#main-file': {
    en: 'File',
    tlh: 'teywI\''
  },
  '#main-robot': {
    en: 'Robot',
    tlh: 'qoq',
  },
  '#main-arena': {
    en: 'Arena',
    tlh: '\'anSa\''
  },
  '#main-help': {
    en: 'Help',
    tlh: 'QaH',
  },
  '#main-arenaTitle': {
    en: 'GearsBot Arena',
    tlh: 'GearsBot \'anSa\''
  },
  '#main-arenaDescription': {
    en: 
      '<p>The GearsBot Arena allows up to 4 robots to compete or cooperate with each other.</p>' +
      '<p>Program your robot using the normal GearsBot page (...where you are now), and export your program and robot as a zip package (Files -> Export Zip...).' +
      'You can then load the zip package into the GearsBot Arena and run it against other players.</p>',
    tlh:
      '<p>veSDuj Data\' \'e\' vIQoy.</p>' +
      '<p>tugh tlhIHtaHghach chutmey pabnIS. chol *ma\'rIgharet*, qaSpa\' je tlhIH.' +
      'tIqDu\'lIjDaq yIlan.</p>',
  },
  '#main-arenaGo': {
    en: 'Go to Arena',
    tlh: 'yIghoS'
  }
};
const MSGS_KEYS = Object.keys(MSGS);

let LANG = localStorage.getItem('LANG');
if (!LANG || LANG == '' || LANG == 'undefined') {
  LANG = 'en';
}

var i18n = new function() {
  var self = this;

  // Get a single string
  this.get = function(requestedKey) {
    for (key of MSGS_KEYS) {
      if (key == requestedKey) {
        let msg = MSGS[key][LANG];
        if (msg == null) {
          msg = MSGS[key]['en'];
        }
        return msg;
      }
    }

    return requestedKey;
  };

  // Change all keys in provided string
  this.replace = function(input) {
    for (key of MSGS_KEYS) {
      input = input.replace(key, self.get(key));
    }
    return input;
  };
}
