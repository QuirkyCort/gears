const MSGS = {
  '#blk-motion': {
    en: 'Motion',
    tlh: 'mo\'Qoq',
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
};
const MSGS_KEYS = Object.keys(MSGS);

const LANG = localStorage.getItem('LANG');
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
