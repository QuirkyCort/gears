import simPython
import time
from parameters import Direction, Stop

# Needed to prevent loops from locking up the javascript thread
SENSOR_DELAY = 0.001

class Motor:
  _STATE_HOLDING = 'holding'
  _STATE_OVERLOADED = 'overloaded'
  _STATE_RAMPING = 'ramping'
  _STATE_RUNNING = 'running'
  _STATE_STALLED = 'stalled'
  _MAX_SPEED = 1600
  _ABS_ACCELERATION = 3200

  def __init__(self, port, positive_direction=Direction.CLOCKWISE, gears=None):
    self.motor = simPython.Motor(port)
    self.motor.polarity(positive_direction)

  def _wait(self, cond, timeout=None):
    """
    Blocks until ``cond(self.state)`` is ``True``.  The condition is
    checked when there is an I/O event related to the ``state`` attribute.
    Exits early when ``timeout`` (in milliseconds) is reached.

    Returns ``True`` if the condition is met, and ``False`` if the timeout
    is reached.

    Valid flags for state attribute: running, ramping, holding,
    overloaded and stalled
    """
    if timeout != None:
      timeout = time.clock() + timeout / 1000.0
    while True:
      time.sleep(0.01)
      if cond(str(self.motor.state())):
        return True
      if timeout != None and time.clock() >= timeout:
        return False

  def _wait_until(self, s, timeout=None):
    """
    Blocks until ``s`` is in ``self.state``.  The condition is checked when
    there is an I/O event related to the ``state`` attribute.  Exits early
    when ``timeout`` (in milliseconds) is reached.

    Returns ``True`` if the condition is met, and ``False`` if the timeout
    is reached.

    Example::
        m.wait_until('stalled')
    """
    return self._wait(lambda state: s in state, timeout)

  def _wait_until_not_moving(self, timeout=None):
    """
    Blocks until one of the following conditions are met:
    - ``running`` is not in ``self.state``
    - ``stalled`` is in ``self.state``
    - ``holding`` is in ``self.state``
    The condition is checked when there is an I/O event related to
    the ``state`` attribute.  Exits early when ``timeout`` (in
    milliseconds) is reached.

    Returns ``True`` if the condition is met, and ``False`` if the timeout
    is reached.

    Example::

        m.wait_until_not_moving()
    """
    return self._wait(lambda state: self._STATE_RUNNING not in state or self._STATE_STALLED in state, timeout)

  def speed(self):
    time.sleep(SENSOR_DELAY)
    return self.motor.speed()

  def angle(self):
    time.sleep(SENSOR_DELAY)
    return self.motor.position()

  def reset_angle(self, angle=0):
    return self.motor.position(angle)

  def stop(self):
    self.motor.stop_action(Stop.COAST)
    return self.motor.command('')

  def brake(self):
    self.motor.stop_action(Stop.BRAKE)
    return self.motor.command('')

  def hold(self):
    self.motor.stop_action(Stop.HOLD)
    return self.motor.command('')

  def run(self, speed):
    self.motor.speed_sp(speed)
    self.motor.command('run-forever')

  def run_time(self, speed, time, then=Stop.HOLD, wait=True):
    self.motor.speed_sp(speed)
    self.motor.time_sp(time / 1000)
    self.motor.stop_action(then)
    
    self.motor.command('run-timed')

    if wait:
      self._wait_until(self._STATE_RUNNING)
      self._wait_until_not_moving()

  def run_angle(self, speed, rotation_angle, then=Stop.HOLD, wait=True):
    self.motor.speed_sp(abs(speed))
    if speed >= 0:
      self.motor.position_sp(rotation_angle)
    else:
      self.motor.position_sp(-rotation_angle)
    self.motor.stop_action(then)
    
    self.motor.command('run-to-rel-pos')

    if wait:
      self._wait_until(self._STATE_RUNNING)
      self._wait_until_not_moving()

  def run_target(self, speed, target_angle, then=Stop.HOLD, wait=True):
    self.motor.speed_sp(abs(speed))
    self.motor.position_sp(target_angle)
    self.motor.stop_action(then)
    
    self.motor.command('run-to-abs-pos')

    if wait:
      self._wait_until(self._STATE_RUNNING)
      self._wait_until_not_moving()

  def run_until_stalled(self, speed, then=Stop.COAST, duty_limit=None):
    self.run(speed)

  def dc(self, duty):
    if duty > 100:
      duty = 100
    elif duty < -100:
      duty = -100
    self.run(duty * 1050 / 100)
  
  def track_target(self, target_angle):
    self.run_target(100, target_angle, then=Stop.COAST, wait=False)
    time.sleep(SENSOR_DELAY)


class TouchSensor:
  def __init__(self, port=None):
    self.sensor = simPython.TouchSensor(port)

  def pressed(self):
    time.sleep(SENSOR_DELAY)
    return self.sensor.isPressed()

class ColorSensor:
  def __init__(self, port=None):
    self.sensor = simPython.ColorSensor(port)

  def color(self):
    time.sleep(SENSOR_DELAY)
    color = self.sensor.color()
    if color == 0:
      return None
    return color

  def ambient(self):
    time.sleep(SENSOR_DELAY)
    return 0

  def reflection(self):
    time.sleep(SENSOR_DELAY)
    return int(list(self.sensor.value())[0] / 2.55)

  def rgb(self):
    time.sleep(SENSOR_DELAY)
    rgb = self.sensor.value()
    for i in range(3):
      rgb[i] = rgb[i] / 2.55
    return rgb

class UltrasonicSensor:
  def __init__(self, port=None):
    self.sensor = simPython.UltrasonicSensor(port)

  def distance(self, silent=False):
    time.sleep(SENSOR_DELAY)
    return self.sensor.dist() * 10

  def presence(self):
    time.sleep(SENSOR_DELAY)
    return False

class GyroSensor:
  def __init__(self, port=None):
    self.sensor = simPython.GyroSensor(port)
    self.zeroAngle = 0

  def speed(self):
    time.sleep(SENSOR_DELAY)
    return self.sensor.yawAngleAndRate(False)[1]

  def angle(self):
    time.sleep(SENSOR_DELAY)
    return self.sensor.yawAngleAndRate(False)[0] - self.zeroAngle

  def reset_angle(self, angle):
    self.zeroAngle = self.angle() - angle

# Virtual Devices
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
