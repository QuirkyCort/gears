import simPython, time

# Needed to prevent loops from locking up the javascript thread
SENSOR_DELAY = 0.001

class Button:
  def __init__(self, address=None):
    self._buttons = simPython.HubButtons()
    self.on_up = None
    self.on_down = None
    self.on_left = None
    self.on_right = None
    self.on_enter = None
    self.on_backspace = None
    self.on_change = None

  @property
  def buttons_pressed(self):
    time.sleep(SENSOR_DELAY)
    return self._buttons.ev3dev_buttons_pressed()

  def any(self):
    time.sleep(SENSOR_DELAY)
    return self._buttons.ev3dev_any()

  def check_buttons(self, buttons=[]):
    time.sleep(SENSOR_DELAY)
    return self._buttons.ev3dev_check_buttons(buttons)

  @property
  def backspace(self):
    time.sleep(SENSOR_DELAY)
    return self._buttons.getButton('backspace')

  @property
  def up(self):
    time.sleep(SENSOR_DELAY)
    return self._buttons.getButton('up')

  @property
  def down(self):
    time.sleep(SENSOR_DELAY)
    return self._buttons.getButton('down')

  @property
  def left(self):
    time.sleep(SENSOR_DELAY)
    return self._buttons.getButton('left')

  @property
  def right(self):
    time.sleep(SENSOR_DELAY)
    return self._buttons.getButton('right')

  @property
  def enter(self):
    time.sleep(SENSOR_DELAY)
    return self._buttons.getButton('enter')

  def wait_for_bump(self, buttons, timeout_ms=None):
    start_time = time.time()
    if timeout_ms:
      timeout_time = start_time + timeout_ms / 1000
    else:
      timeout_time = -1

    pressed = False

    while time.time() < timeout_time or timeout_time == -1:
      if self.check_buttons(buttons):
        pressed = True
      if pressed and not self.check_buttons(buttons):
        return True

    return False

  def wait_for_pressed(self, buttons, timeout_ms=None):
    start_time = time.time()
    if timeout_ms:
      timeout_time = start_time + timeout_ms / 1000
    else:
      timeout_time = -1

    while time.time() < timeout_time or timeout_time == -1:
      if self.check_buttons(buttons):
        return True

    return False

  def wait_for_released(self, buttons, timeout_ms=None):
    start_time = time.time()
    if timeout_ms:
      timeout_time = start_time + timeout_ms / 1000
    else:
      timeout_time = -1

    while time.time() < timeout_time or timeout_time == -1:
      if not self.check_buttons(buttons):
        return True

    return False

  def process(self, new_state=None):
    time.sleep(SENSOR_DELAY)
    current_state = self._buttons.getButtons()
    changed = []

    try:
      for btn in current_state:
        if current_state[btn] != self.prev_state[btn]:
          changed.append((btn, current_state[btn]))
          if btn == 'left' and callable(self.on_left):
            self.on_left(current_state[btn])
          elif btn == 'right' and callable(self.on_right):
            self.on_right(current_state[btn])
          elif btn == 'up' and callable(self.on_up):
            self.on_up(current_state[btn])
          elif btn == 'down' and callable(self.on_down):
            self.on_down(current_state[btn])
          elif btn == 'enter' and callable(self.on_enter):
            self.on_enter(current_state[btn])
          elif btn == 'backspace' and callable(self.on_backspace):
            self.on_backspace(current_state[btn])
    except AttributeError:
      pass

    if len(changed) > 0 and callable(self.on_change):
      self.on_change(changed)

    self.prev_state = current_state