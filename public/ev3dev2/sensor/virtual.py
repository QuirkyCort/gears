import simPython, time

# Needed to prevent loops from locking up the javascript thread
SENSOR_DELAY = 0.001

class GPSSensor:
  _DRIVER_NAME = 'virtual-gps'

  def __init__(self, address=None):
    self.sensor = simPython.GPSSensor(address)

  @property
  def position(self):
    time.sleep(SENSOR_DELAY)
    return list(self.sensor.position())

  @property
  def x(self):
    time.sleep(SENSOR_DELAY)
    return list(self.sensor.position())[0]

  @property
  def y(self):
    time.sleep(SENSOR_DELAY)
    return list(self.sensor.position())[2]

  @property
  def altitude(self):
    time.sleep(SENSOR_DELAY)
    return list(self.sensor.position())[1]
