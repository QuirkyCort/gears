function GenConfig(caller, $settingsArea) {
  var self = this;
  var gen = {};

  this.getTitle = function(opt) {
    let $title = $('<div class="configurationTitle"></div>');
    let $toolTip = $('<span> </span><div class="tooltip">?<div class="tooltiptext"></div></div>');
    $title.text(opt.option);

    if (opt.help) {
      $toolTip.find('.tooltiptext').text(opt.help);
      $title.append($toolTip);
    }
    if (opt.helpSide) {
      $toolTip.addClass(opt.helpSide);
    } else {
      $toolTip.addClass('right');
    }

    return $title;
  }

  gen.label = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');
    let $textBox = $('<div class="text"></div>');
    $textBox.text(opt.text);

    $div.append($textBox);

    return $div;
  }

  gen.buttons = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');
    let $buttonsBox = $('<div class="color"></div>');

    for (let button of opt.buttons) {
      let $button = $('<button></button>');
      $button.text(button.label);
      $button.click(function() {
        caller[button.callback](currentOptions);
      });
      $buttonsBox.append($button);
    }

    $div.append($buttonsBox);

    return $div;
  }

  gen.custom = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');
    $div.append(self.getTitle(opt));
    $div.append(caller[opt.generatorFunction](currentOptions))

    return $div;
  }

  gen.color = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');
    let $colorBox = $('<div class="color"><input type="color"><input type="text"></div>');
    let $alphaBox = $('<div class="slider">Opacity: <input type="range"></div>');
    let $color = $colorBox.find('input[type=color]');
    let $text = $colorBox.find('input[type=text]');
    let $alpha = $alphaBox.find('input');
    $alpha.attr('min', 0);
    $alpha.attr('max', 255);
    $alpha.attr('step', 1);
    let currentVal = currentOptions[opt.option];

    if (typeof currentVal == 'undefined') {
      currentVal = '#f09c0d';
    }

    function setInputs(currentVal) {
      // Strip hex
      if (currentVal[0] == '#') {
        currentVal = currentVal.slice(1);
      }

      // Convert 3/4 notation to 6/8
      if (currentVal.length < 6) {
        let tmp = '';
        for (let c of currentVal) {
          tmp = c + c;
        }
        currentVal = tmp;
      }

      // Split into color and alpha
      let currentValColor = currentVal.slice(0,6).toLowerCase();
      let currentValAlpha = currentVal.slice(6,8);
      if (currentValAlpha == '') {
        currentValAlpha = 255;
      } else {
        currentValAlpha = parseInt(currentValAlpha, 16);
      }

      $color.val('#' + currentValColor);
      $alpha.val(currentValAlpha);
      $text.val('#' + currentValColor + ('0' + currentValAlpha.toString(16)).slice(-2));
    }

    setInputs(currentVal);

    function setColor() {
      let valColor = $color.val();
      let valAlpha = $alpha.val();
      valAlpha = ('0' + parseInt(valAlpha).toString(16)).slice(-2);

      let val = valColor + valAlpha;
      caller.saveHistory();
      currentOptions[opt.option] = val;
      $text.val(val);
      if (opt.reset) {
        caller.resetScene(false);
      }
    }

    $color.change(setColor);
    $alpha.change(setColor);
    $text.change(function(){
      let val = $text.val();
      setInputs(val);
      caller.saveHistory();
      currentOptions[opt.option] = val;
      if (opt.reset) {
        caller.resetScene(false);
      }
    });

    $div.append(self.getTitle(opt));
    $div.append($colorBox);
    $div.append($alphaBox);

    return $div;
  }

  gen.sliderBox = function(opt, currentValue, callback) {
    let $sliderBox = $(
      '<div class="slider">' +
        '<input type="range">' +
        '<input type="text">' +
      '</div>'
    );
    let $slider = $sliderBox.find('input[type=range]');
    let $input = $sliderBox.find('input[type=text]');

    $slider.attr('min', opt.min);
    $slider.attr('max', opt.max);
    $slider.attr('step', opt.step);
    $slider.attr('value', currentValue);
    $input.val(currentValue);

    $slider.on('input', function(){
      $input.val($slider.val());
    });
    $slider.on('change', function(){
      caller.saveHistory();
      callback(parseFloat($slider.val()));
      if (opt.reset) {
        caller.resetScene(false);
      }
    })
    $input.change(function(){
      caller.saveHistory();
      callback(parseFloat($input.val()));
      $slider.val($input.val());
      if (opt.reset) {
        caller.resetScene(false);
      }
    });

    return $sliderBox;
  }

  gen.vectors = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');

    $div.append(self.getTitle(opt));

    if (currentOptions[opt.option] == null) {
      currentOptions[opt.option] = [0,0,0];
    }

    currentOptions[opt.option].forEach(function(currentOption, i){
      let slider = null;

      if (typeof opt.deg2rad != 'undefined' && opt.deg2rad) {
        slider = gen.sliderBox(opt, currentOption / Math.PI * 180, function(val) {
          currentOptions[opt.option][i] = val / 180 * Math.PI;
        });
      } else {
        slider = gen.sliderBox(opt, currentOption, function(val) {
          currentOptions[opt.option][i] = val;
        });
      }
      $div.append(slider);
    })

    return $div;
  }

  gen.slider = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');

    $div.append(self.getTitle(opt));
    $div.append(gen.sliderBox(opt, currentOptions[opt.option], function(val) {
      currentOptions[opt.option] = val;
    }));

    return $div;
  }

  gen.floatText = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');
    let $textBox = $('<div class="text"><input type="text"></div>');
    let $input = $textBox.find('input');
    let currentVal = currentOptions[opt.option];

    $input.val(currentVal);

    $input.change(function(){
      let val = parseFloat($input.val())
      if (isNaN(val)) {
        toastMsg('Not a valid number');
      } else {
        caller.saveHistory();
        currentOptions[opt.option] = val;
        if (opt.reset) {
          caller.resetScene(false);
        }
      }
    });

    $div.append(self.getTitle(opt));
    $div.append($textBox);

    return $div;
  }

  gen.intText = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');
    let $textBox = $('<div class="text"><input type="text"></div>');
    let $input = $textBox.find('input');
    let currentVal = currentOptions[opt.option];

    $input.val(currentVal);

    $input.change(function(){
      let val = parseInt($input.val())
      if (isNaN(val)) {
        toastMsg('Not a valid number');
      } else {
        caller.saveHistory();
        currentOptions[opt.option] = val;
        if (opt.reset) {
          caller.resetScene(false);
        }
      }
    });

    $div.append(self.getTitle(opt));
    $div.append($textBox);

    return $div;
  }

  gen.strText = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');
    let $textBox = $('<div class="text"><input type="text"></div>');
    let $input = $textBox.find('input');
    let currentVal = currentOptions[opt.option];

    $input.val(currentVal);

    $input.change(function(){
      caller.saveHistory();
      currentOptions[opt.option] = $input.val();
      if (opt.reset) {
        caller.resetScene(false);
      }
    });

    $div.append(self.getTitle(opt));
    $div.append($textBox);

    return $div;
  }

  gen.boolean = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');
    let $checkBox = $('<div class="text"><input type="checkbox"></div>');
    let $input = $checkBox.find('input');
    let currentVal = currentOptions[opt.option];

    $input.prop('checked', currentVal);

    $input.change(function(){
      caller.saveHistory();
      currentOptions[opt.option] = $input.prop('checked');
      if (opt.reset) {
        caller.resetScene(false);
      }
    });

    $div.append(self.getTitle(opt));
    $div.append($checkBox);

    return $div;
  }

  gen.select = function(opt, currentOptions) {
    let $div = $('<div class="configuration"></div>');
    let $select = $('<select></select>');
    let currentVal = currentOptions[opt.option];

    opt.options.forEach(function(option){
      let $opt = $('<option></option>');
      $opt.prop('value', option[1]);
      $opt.text(option[0]);
      if (option[1] == currentVal) {
        $opt.attr('selected', true);
      }

      $select.append($opt);
    });

    $select.change(function(){
      caller.saveHistory();
      currentOptions[opt.option] = $select.val();
      if (opt.reset) {
        caller.resetScene(false);
      }
    });

    $div.append(self.getTitle(opt));
    $div.append($select);

    return $div;
  }

  this.displayOptionsConfigurations = function(template, currentOptions) {
    template.optionsConfigurations.forEach(function(optionConfiguration){
      if (typeof gen[optionConfiguration.type] != 'undefined') {
        $settingsArea.append(gen[optionConfiguration.type](optionConfiguration, currentOptions));
      } else {
        console.log('Unrecognized configuration type');
      }
    });
  }
}