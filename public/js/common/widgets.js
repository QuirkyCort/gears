// Read query string
function readGET(name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results==null){
    return null;
  } else {
    return decodeURI(results[1]);
  }
}

// Set on click animation
function setOnClickAnimation($buttons) {
  $buttons.forEach(function($button){
    if (typeof $button[0] != 'undefined') {
      $button[0].addEventListener('pointerdown', function() { $button.addClass('animateClick')});
      $button[0].addEventListener('pointerup', function() { $button.removeClass('animateClick')});
      $button[0].addEventListener('pointerout', function() { $button.removeClass('animateClick')});
    }
  });
}

// File menu dropdown
function menuDropDown($menuBtn, menuItems, options) {
  var $dropDown = $(
    '<ul class="menuDropDown ' + options.className + '"></ul>'
  );

  menuItems.forEach(function(menuItem) {
    let $li = $('<li></li>');
    $li.html(menuItem.html);
    if (menuItem.line) {
      $li.addClass('underline');
    }
    $li.click(function() { menuItem.callback($li); });
    $dropDown.append($li);
  });

  if (options.parentIsAbsolute) {
    $dropDown.addClass('menuDropDownRightAlign')
  } else {
    let top = $menuBtn[0].offsetTop + $menuBtn[0].offsetHeight;
    $dropDown.css('top', top);
  }

  if (options.align == 'right') {
    $dropDown.css('left', 'auto');
    $dropDown.css('right', '0');
  } else {
    let left = $menuBtn[0].offsetLeft;
    $dropDown.css('left', left);
  }

  $(document).one('click', function(e){
    $('.menuDropDown').remove();
  });

  $menuBtn.append($dropDown);

  return $menuBtn;
}

// Adds the "pressed" class on touch, and remove when released
function setOnTouch(el) {
  if (el.constructor === Array) {
    el.forEach(function($element) {
      $element.on('touchstart', function() { $(this).addClass('pressed'); });
      $element.on('touchend', function() { $(this).removeClass('pressed'); });
    });
  } else {
    el.on('touchstart', function() { $(this).addClass('pressed'); });
    el.on('touchend', function() { $(this).removeClass('pressed'); });
  }
}

// Pop an error message around an element
function popErrorMsg(element, message, pos) {
  pos = (typeof pos !== 'undefined') ?  pos : 'top';

  $(element).popover({
    content: message,
    placement: pos
  });
  $(element).popover('show');
  setTimeout(function() {
    $(element).popover('hide'); }
    , 1000
  );
  setTimeout(function() {
    $(element).popover('destroy'); }
    , 1500
  );
}

// Toast message right at the top
function toastMsg(message) {
  var $toast = $('<div class="toastMsg">' + message + '</div>');
  $toast.on('animationend', function() { $toast.remove(); });
  $('html > body').append($toast);
}

// Show activity spinner
function showSpinner() {
  if (typeof $('#activitySpinner')[0] === 'undefined') {
    var spinner = '<div id="activitySpinner"><i class="fas fa-sync fa-spin"></i></div>';

    $('html > body').append(spinner);
  }
}

// Hide activity spinner
function hideSpinner() {
  if (typeof $('#activitySpinner')[0] !== 'undefined') {
    $('#activitySpinner').remove();
  }
}

// Hides most text and add a "more..." to an element
function moreText($element, length) {
  if (typeof length == 'undefined') {
    length = 60;
  }
  if (length >= $element.text().length) {
    return;
  }

  var fullText = $element.text().trim();
  var shortText = fullText.substr(0,length) + '... ';

  $element[0].fullText = fullText;
  $element.html(shortText);

  var more = $('<span class="moreText">more&gt;</span>');
  more.click(function() {
    var fullText = $(this).parent()[0].fullText;

    $(this).parent().html(fullText);
  });

  $element.append(more);
}

// Generic dialog window
function dialog(title, $bodyContent, $buttons, className='') {
  var $dialog = $('<div class="dialogScreen '+ className + '"></div>');
  var $box = $(
    '<div class="dialogWindow">' +
    '<div class="dialogTitle">' + title + '</div>' +
    '</div>'
  );
  var $body = $('<div class="dialogBody"></div>');
  var $buttonsRow = $('<div class="dialogButtonsRow">');

  $body.append($bodyContent);
  $box.append($body);
  $buttonsRow.append($buttons);
  $box.append($buttonsRow);
  $dialog.append($box);

  $dialog.$body = $body;
  $dialog.$buttonsRow = $buttonsRow;

  $buttons = $buttonsRow.children();

  $dialog.close = function(callback) {
    $box.on('animationend', function() {
      if (typeof callback != 'undefined') {
        callback($dialog);
      }
      $dialog.remove();
    });
    $box.addClass('animatedHide');
  };

  $('html > body').append($dialog);

  return $dialog;
}

// Confirmation dialog
function confirmDialog(options, callback) {
  if (typeof options == 'string') {
    options = { message: options };
  }

  if (typeof options.title == 'undefined') {
    options.title = 'Confirm?';
  }
  if (typeof options.cancel == 'undefined') {
    options.cancel = 'Cancel';
  }
  if (typeof options.confirm == 'undefined') {
    options.confirm = 'Ok';
  }

  var bodyContent = options.message;
  var $buttons = $(
    '<button type="button" class="cancel btn btn-light">' + options.cancel + '</button>' +
    '<button type="button" class="confirm btn btn-success">' + options.confirm + '</button>'
  );

  var $dialog = dialog(options.title, bodyContent, $buttons);

  $buttons.siblings('.cancel').click(function() { $dialog.close(); });
  $buttons.siblings('.confirm').click(function() { $dialog.close(); callback(); });

  return $dialog;
}

// Acknowledge dialog (single button)
function acknowledgeDialog(options, callback) {
  if (typeof options == 'string') {
    options = { message: options };
  }

  if (typeof options.title == 'undefined') {
    options.title = 'Completed';
  }
  if (typeof options.ok == 'undefined') {
    options.ok = 'OK';
  }

  var bodyContent = options.message;
  var $button = $(
    '<button type="button" class="ok btn btn-success">' + options.ok + '</button>'
  );

  var $dialog = dialog(options.title, bodyContent, $button, options.className);

  $button.click(function() { $dialog.close(callback); });

  return $dialog;
}

// Error modal. Only close when clicked.
function showErrorModal(errors) {
  var errorsDiv = '';
  if (errors.constructor === Array) {
    errors.forEach(function(error) { errorsDiv += '<div class="errorBody">' + error + '</div>'; });
  } else {
    errorsDiv = errors;
  }

  var options = {
    title: 'Error',
    message: errorsDiv,
  }

  acknowledgeDialog(options);
}