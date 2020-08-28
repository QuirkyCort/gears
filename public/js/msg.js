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
    fr: 'Moteur',
  },
  '#blk-sensors': {
    en: 'Sensors',
    tlh: 'ghe\'\'or',
    fr: 'Capteurs',
  },
  '#blk-sound': {
    en: 'Sound',
    tlh: 'wab',
    fr: 'Sons',
  },
  '#blk-control': {
    en: 'Control',
    tlh: 'SeH',
    fr: 'Contrôle',
  },
  '#blk-logic': {
    en: 'Logic',
    tlh: 'wanl\'',
    fr: 'Logique',
  },
  '#blk-loops': {
    en: 'Loops',
    tlh: 'QoQ',
    fr: 'Boucles',
  },
  '#blk-math': {
    en: 'Math',
    tlh: 'ma\'rIch',
    fr: 'Maths',
  },
  '#blk-text': {
    en: 'Text',
    tlh: 'wej',
    fr: 'Texte',
  },
  '#blk-lists': {
    en: 'Lists',
    tlh: 'tlhegh',
    fr: 'Listes',
  },
  '#blk-variables': {
    en: 'Variables',
    tlh: 'qeylIS',
    fr: 'Variables',
  },
  '#blk-functions': {
    en: 'Functions',
    tlh: 'tlhaw\'DIyuS',
    fr: 'Fonctions',
  },
  '#blk-when_started': {
    en: 'When Started',
    fr: 'Au démarrage',
  },
  '#main-blocks': {
    en: 'Blocks',
    tlh: 'Porgh',
    fr: 'Blocs',
  },
  '#main-sim': {
    en: 'Simulator',
    tlh: 'ghertlhuD',
    fr: 'Simulateur',
  },
  '#main-file': {
    en: 'File',
    tlh: 'teywI\'',
    fr: 'Fichier',
  },
  '#main-robot': {
    en: 'Robot',
    tlh: 'qoq',
    fr: 'Robot',
  },
  '#main-arena': {
    en: 'Arena',
    tlh: '\'anSa\'',
    fr: 'Arène',
  },
  '#main-help': {
    en: 'Help',
    tlh: 'QaH',
    fr: 'Aide',
  },
  '#main-arenaTitle': {
    en: 'GearsBot Arena',
    tlh: 'GearsBot \'anSa\'',
    fr: 'Arène GearsBot',
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
    fr:
      '<p>L\'arène GearsBot permet de faire collaborer ou de s\'affronter jusqu\'à 4 robots simultanément.</p>' +
      '<p>Programmez votre robot depuis la page principale (...celle-ci donc), et expoertez votre programme et votre robot comme un paquet zip (Fichier -> Export Zip...).' +
      'Vous pouvez charger le paquet zip dans l\'arène GearsBot et le lancer contre les autres joueurs.</p>',
  },
  '#main-arenaGo': {
    en: 'Go to Arena',
    tlh: 'yIghoS',
    fr: 'En route pour l\'arène',
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
