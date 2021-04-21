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
    pos = self.sensor.position()
    return (pos[0], pos[2], pos[1])

  @property
  def x(self):
    return self.position[0]

  @property
  def y(self):
    return self.position[1]

  @property
  def altitude(self):
    return self.position[2]

class ObjectTracker:
  _DRIVER_NAME = 'virtual-objecttracker'

  def __init__(self,address=None):
    self.sensor = simPython.ObjectTracker(address)

  def position(self,name):
    time.sleep(SENSOR_DELAY)
    pos = self.sensor.position(name)
    if not pos is None:
      return (pos[0],pos[2],pos[1])
    return None

  def velocity(self,name):
    time.sleep(SENSOR_DELAY)
    vel = self.sensor.velocity(name)
    if not vel is None:
      return (vel[0],vel[2],vel[1])
    return None

  def x(self,name):
    pos =  self.position(name)
    if pos is None:
      return None
    return pos[0]

  def y(self,name):
    pos = self.position(name)
    if pos is None:
      return None
    return pos[1]

  def altitude(self,name):
    pos = self.position(name)
    if pos is None:
      return None
    return pos[2]

  def vx(self,name):
    vel = self.velocity(name)
    if vel is None:
      return None
    return vel[0]

  def vy(self,name):
    vel = self.velocity(name)
    if vel is None:
      return None
    return vel[1]

  def valtitude(self,name):
    vel = self.velocity(name)
    if vel is None:
      return None
    return vel[2]

class Pen:
  _DRIVER_NAME = 'virtual-pen'

  def __init__(self, address=None):
    self.pen = simPython.Pen(address)

  def down(self):
    self.pen.down()

  def up(self):
    self.pen.up()

  def isDown(self):
    return self.pen.isDown()

  def setColor(self, r=0.5, g=0.5, b=0.5):
    """
    Set the color of the current pen trace.  rgb values should be in the
    range [0,1].  If called after pen down(), the trace will change color
    starting at the position where setColor() was called.
    """
    for channel_val, c_name in [(r, 'red'), (g, 'green'), (b, 'blue')]:
      if channel_val < 0.0 or channel_val > 1.0:
        raise ValueError('{} color channel must be in range [0,1]', c_name)
      self.pen.setColor(r, g, b)

  def setWidth(self, width=1.0):
    if width < 0:
        raise ValueError('pen width must be >= 0')
    self.pen.setWidth( width )

class Radio:
  _DRIVER_NAME = 'virtual-radio'

  def __init__(self, address=None):
    self.radio = simPython.Radio()

  def send(self, dest, mailbox, value):
    time.sleep(SENSOR_DELAY)
    return self.radio.send(dest, mailbox, value)

  def available(self, mailbox):
    time.sleep(SENSOR_DELAY)
    return self.radio.available(mailbox)

  def read(self, mailbox):
    time.sleep(SENSOR_DELAY)
    return self.radio.read(mailbox)

  def empty(self, mailbox=None):
    time.sleep(SENSOR_DELAY)
    return self.radio.empty(mailbox)
