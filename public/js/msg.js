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
    es: 'Motor',
    fr: 'Moteur',
  },
  '#blk-sensors': {
    en: 'Sensors',
    tlh: 'ghe\'\'or',
    es: 'Sensores',
    fr: 'Capteurs',
  },
  '#blk-sound': {
    en: 'Sound',
    tlh: 'wab',
    es: 'Sonido',
    fr: 'Sons',
  },
  '#blk-control': {
    en: 'Control',
    tlh: 'SeH',
    es: 'Control',
    fr: 'Contrôle',
  },
  '#blk-logic': {
    en: 'Logic',
    tlh: 'wanl\'',
    es: 'Logica',
    fr: 'Logique',
  },
  '#blk-loops': {
    en: 'Loops',
    tlh: 'QoQ',
    es: 'Bucles',
    fr: 'Boucles',
  },
  '#blk-math': {
    en: 'Math',
    tlh: 'ma\'rIch',
    es: 'Matematica',
    fr: 'Maths',
  },
  '#blk-text': {
    en: 'Text',
    tlh: 'wej',
    es: 'Texto',
    fr: 'Texte',
  },
  '#blk-lists': {
    en: 'Lists',
    tlh: 'tlhegh',
    es: 'Listas',
    fr: 'Listes',
  },
  '#blk-variables': {
    en: 'Variables',
    tlh: 'qeylIS',
    es: 'Variables',
    fr: 'Variables',
  },
  '#blk-functions': {
    en: 'Functions',
    tlh: 'tlhaw\'DIyuS',
    es: 'Funciones',
    fr: 'Fonctions',
  },
  '#blk-when_started': {
    en: 'When Started',
    es: 'Al comenzar',
    fr: 'Au démarrage',
  },
  '#main-blocks': {
    en: 'Blocks',
    tlh: 'Porgh',
    es: 'Bloques',
    fr: 'Blocs',
  },
  '#main-sim': {
    en: 'Simulator',
    tlh: 'ghertlhuD',
    es: 'Simulador',
    fr: 'Simulateur',
  },
  '#main-file': {
    en: 'File',
    tlh: 'teywI\'',
    es: 'Archivo',
    fr: 'Fichier',
  },
  '#main-robot': {
    en: 'Robot',
    tlh: 'qoq',
    es: 'Robot',
    fr: 'Robot',
  },
  '#main-arena': {
    en: 'Arena',
    tlh: '\'anSa\'',
    es: 'Pista',
    fr: 'Arène',
  },
  '#main-help': {
    en: 'Help',
    tlh: 'QaH',
    es: 'Ayuda',
    fr: 'Aide',
  },
  '#main-arenaTitle': {
    en: 'GearsBot Arena',
    tlh: 'GearsBot \'anSa\'',
    es: 'Pista GearsBot',
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
    es:
      '<p>La Pista GearsBot permite hasta 4 robots para competir o colaborar uno con el otro.</p>' +
      '<p>Programa tu robot usando la página principal de GearsBot (...donde te encuentras ahora), y exporta tu programa y robot como un archivo zip. (Archivo -> Exportar Zip...).' +
      'Entonces puedes cargar el archivo zip en la Pista GearsBot y ejecutarlo contra otros jugadores.</p>',
    fr:
      '<p>L\'arène GearsBot permet de faire collaborer ou de s\'affronter jusqu\'à 4 robots simultanément.</p>' +
      '<p>Programmez votre robot depuis la page principale (...celle-ci donc), et expoertez votre programme et votre robot comme un paquet zip (Fichier -> Export Zip...).' +
      'Vous pouvez charger le paquet zip dans l\'arène GearsBot et le lancer contre les autres joueurs.</p>',
  },
  '#main-arenaGo': {
    en: 'Go to Arena',
    tlh: 'yIghoS',
    es: 'Ir a la Pista',
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
