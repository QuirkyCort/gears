import simPython, time

# Needed to prevent loops from locking up the javascript thread
SENSOR_DELAY = 0.001

class ColorSensor:
  _DRIVER_NAME = 'lego-ev3-color'

  MODE_COL_REFLECT = 'COL-REFLECT'
  MODE_COL_AMBIENT = 'COL-AMBIENT'
  MODE_COL_COLOR = 'COL-COLOR'
  MODE_REF_RAW = 'REF-RAW'
  MODE_RGB_RAW = 'RGB-RAW'

  def __init__(self, address=None):
    self.sensor = simPython.ColorSensor(address)

  @property
  def reflected_light_intensity(self):
    time.sleep(SENSOR_DELAY)
    return int(list(self.sensor.value())[0] / 2.55)

  @property
  def ambient_light_intensity(self):
    return 0

  @property
  def color(self):
    time.sleep(SENSOR_DELAY)
    return self.sensor.color()

  @property
  def color_name(self):
    time.sleep(SENSOR_DELAY)
    return self.sensor.colorName()

  @property
  def raw(self):
    return self.rgb

  @property
  def calibrate_white(self):
    return 0

  @property
  def rgb(self):
    time.sleep(SENSOR_DELAY)
    rgb = self.sensor.value()
    for i in range(3):
      rgb[i] = int(rgb[i])
    return rgb

  @property
  def lab(self):
    time.sleep(SENSOR_DELAY)
    lab = self.sensor.valueLAB()
    for i in range(3):
      lab[i] = int(lab[i])
    return lab

  @property
  def hsv(self):
    time.sleep(SENSOR_DELAY)
    hsv = self.sensor.valueHSV()
    for i in range(3):
      hsv[i] = int(hsv[i])
    return hsv

  @property
  def hls(self):
    time.sleep(SENSOR_DELAY)
    hls = self.sensor.valueHLS()
    for i in range(3):
      hls[i] = int(hls[i])
    return hls

  @property
  def red(self):
    time.sleep(SENSOR_DELAY)
    return int(self.sensor.value()[0])

  @property
  def green(self):
    time.sleep(SENSOR_DELAY)
    return int(self.sensor.value()[1])

  @property
  def blue(self):
    time.sleep(SENSOR_DELAY)
    return int(self.sensor.value()[2])

class GyroSensor:
  _DRIVER_NAME = 'lego-ev3-gyro'

  MODE_GYRO_ANG = 'GYRO-ANG'
  MODE_GYRO_CAL = 'GYRO-CAL'
  MODE_GYRO_FAS = 'GYRO-FAS'
  MODE_GYRO_G_A = 'GYRO-G&A'
  MODE_GYRO_RATE = 'GYRO-RATE'
  MODE_TILT_ANG = 'TILT-ANGLE'
  MODE_TILT_RATE = 'TILT-RATE'

  def __init__(self, address=None):
    self.sensor = simPython.GyroSensor(address)
    self.float = False

  @property
  def angle(self):
    return self.angle_and_rate[0]

  @property
  def rate(self):
    return self.angle_and_rate[1]

  @property
  def angle_and_rate(self):
    time.sleep(SENSOR_DELAY)
    return self.sensor.yawAngleAndRate(self.float)

  @property
  def pitch_angle(self):
    return self.pitch_angle_and_rate[0]

  @property
  def pitch_rate(self):
    return self.pitch_angle_and_rate[1]

  @property
  def pitch_angle_and_rate(self):
    time.sleep(SENSOR_DELAY)
    return self.sensor.pitchAngleAndRate(self.float)

  @property
  def roll_angle(self):
    return self.roll_angle_and_rate[0]

  @property
  def roll_rate(self):
    return self.roll_angle_and_rate[1]

  @property
  def roll_angle_and_rate(self):
    time.sleep(SENSOR_DELAY)
    return self.sensor.rollAngleAndRate(self.float)

  def reset(self):
    self.sensor.reset()
    return

  def wait_until_angle_changed_by(self, delta, direction_sensitive=False):
    if delta == 0:
      return True

    max_angle = self.angle + abs(delta)
    min_angle = self.angle - abs(delta)

    while True:
      time.sleep(0.01)
      if direction_sensitive and delta > 0:
        if self.angle >= max_angle:
          return True
      elif direction_sensitive and delta < 0:
        if self.angle <= min_angle:
          return True
      else:
        if self.angle >= max_angle or self.angle <= min_angle:
          return True

class UltrasonicSensor:
  _DRIVER_NAME = 'lego-ev3-us'

  MODE_US_DIST_CM = 'US-DIST-CM'
  MODE_US_DIST_IN = 'US-DIST-IN'
  MODE_US_LISTEN = 'US-LISTEN'
  MODE_US_SI_CM = 'US-SI-CM'
  MODE_US_SI_IN = 'US-SI-IN'

  def __init__(self, address=None):
    self.sensor = simPython.UltrasonicSensor(address)

  @property
  def distance_centimeters_continuous(self):
    return self.distance_centimeters

  @property
  def distance_centimeters_ping(self):
    return self.distance_centimeters

  @property
  def distance_centimeters(self):
    time.sleep(SENSOR_DELAY)
    return self.sensor.dist()

  @property
  def distance_inches_continuous(self):
    return self.distance_centimeters / 2.54

  @property
  def distance_inches_ping(self):
    return self.distance_centimeters / 2.54

  @property
  def distance_inches(self):
    return self.distance_centimeters / 2.54

  @property
  def other_sensor_present(self):
    time.sleep(SENSOR_DELAY)
    return False

# Alias for clarity
LaserRangeSensor = UltrasonicSensor

class TouchSensor:
  _DRIVER_NAME = 'lego-ev3-touch'

  MODE_TOUCH = 'TOUCH'

  def __init__(self, address=None):
    self.sensor = simPython.TouchSensor(address)

  @property
  def is_pressed(self):
    time.sleep(SENSOR_DELAY)
    return self.sensor.isPressed()

  @property
  def is_released(self):
    time.sleep(SENSOR_DELAY)
    return not self.sensor.isPressed()

  def _wait(self, desired_state, timeout_ms, sleep_ms):
    tic = time.time()

    if sleep_ms:
      sleep_sec = float(sleep_ms/1000)

    while True:
      if self.is_pressed == desired_state:
        return True

      if timeout_ms is not None and time.time() >= tic + timeout_ms/1000:
        return False

      if sleep_ms:
        time.sleep(sleep_sec)

  def wait_for_pressed(self, timeout_ms=None, sleep_ms=10):
    return self._wait(True, timeout_ms, sleep_ms)

  def wait_for_released(self, timeout_ms=None, sleep_ms=10):
    return self._wait(False, timeout_ms, sleep_ms)

  def wait_for_bump(self, timeout_ms=None, sleep_ms=10):
    start_time = time.time()

    if self.wait_for_pressed(timeout_ms, sleep_ms):
      if timeout_ms is not None:
        timeout_ms -= int((time.time()-start_time) * 1000)
      return self.wait_for_released(timeout_ms, sleep_ms)

    return False