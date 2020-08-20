import simPython, time

# Needed to prevent loops from locking up the javascript thread
SENSOR_DELAY = 0.001

class ColorSensor:
  _DRIVER_NAME = 'lego-ev3-color'

  COLOR_NOCOLOR = 0 # HSV values from https://lego.fandom.com/wiki/Colour_Palette
  COLOR_BLACK = 1   # 0, 0, 0
  COLOR_BLUE = 2    # 207, 64, 78
  COLOR_GREEN = 3   # 120, 100, 60
  COLOR_YELLOW = 4  # 60, 100, 100
  COLOR_RED = 5     # 0, 100, 100
  COLOR_WHITE = 6   # 0, 0, 100
  COLOR_BROWN = 7   # 24, 79, 25

  COLORS = (
      'NoColor',
      'Black',
      'Blue',
      'Green',
      'Yellow',
      'Red',
      'White',
      'Brown',
    )

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
    hsv = self.hsv

    if hsv[1] < 20:
      if hsv[2] < 30:
        return self.COLOR_BLACK
      else:
        return self.COLOR_WHITE

    elif hsv[0] < 30:
      return self.COLOR_RED

    elif hsv[0] < 90:
      return self.COLOR_YELLOW

    elif hsv[0] < 163:
      return self.COLOR_GREEN

    elif hsv[0] < 283:
      return self.COLOR_BLUE

    else:
      return self.COLOR_RED

  @property
  def color_name(self):
    return self.COLORS[self.color]

  @property
  def raw(self):
    return self.rgb

  @property
  def calibrate_white(self):
    return 0

  @property
  def rgb(self):
    time.sleep(SENSOR_DELAY)
    rgb = list(self.sensor.value())
    for i in range(3):
      rgb[i] = int(rgb[i])
    return rgb

  @property
  def lab(self):
    time.sleep(SENSOR_DELAY)
    lab = list(self.sensor.valueLAB())
    for i in range(3):
      lab[i] = int(lab[i])
    return lab

  @property
  def hsv(self):
    time.sleep(SENSOR_DELAY)
    hsv = list(self.sensor.valueHSV())
    for i in range(3):
      hsv[i] = int(hsv[i])
    return hsv

  @property
  def hls(self):
    time.sleep(SENSOR_DELAY)
    hls = list(self.sensor.valueHLS())
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

  @property
  def angle(self):
    time.sleep(SENSOR_DELAY)
    return self.angle_and_rate[0]

  @property
  def rate(self):
    time.sleep(SENSOR_DELAY)
    return self.angle_and_rate[1]

  @property
  def angle_and_rate(self):
    time.sleep(SENSOR_DELAY)
    angle_and_rate = list(self.sensor.angleAndRate())
    for i in range(2):
      angle_and_rate[i] = int(angle_and_rate[i])
    return angle_and_rate

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
    return float(self.sensor.dist())

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
