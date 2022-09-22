import simPython, time

# Needed to prevent loops from locking up the javascript thread
SENSOR_DELAY = 0.001

WAIT_RUNNING_TIMEOUT = 100

OUTPUT_A = 'outA'
OUTPUT_B = 'outB'
OUTPUT_C = 'outC'
OUTPUT_D = 'outD'
OUTPUT_E = 'outE'
OUTPUT_F = 'outF'
OUTPUT_G = 'outG'
OUTPUT_H = 'outH'
OUTPUT_I = 'outI'
OUTPUT_J = 'outJ'
OUTPUT_K = 'outK'
OUTPUT_L = 'outL'
OUTPUT_M = 'outM'
OUTPUT_N = 'outN'
OUTPUT_O = 'outO'
OUTPUT_P = 'outP'
OUTPUT_Q = 'outQ'
OUTPUT_R = 'outR'
OUTPUT_S = 'outS'
OUTPUT_T = 'outT'

class SpeedValue:
  """
  The base class for the SpeedValue classes.
  Not meant to be used directly.
  Use SpeedNativeUnits, SpeedPercent, SpeedRPS, SpeedRPM, SpeedDPS, SpeedDPM
  """

  def __lt__(self, other):
    return self.to_native_units() < other.to_native_units()

  def __rmul__(self,other):
    return self.__mul__(other)

  def to_native_units(self):
    pass

  def __mul__(self, other):
    pass


class SpeedPercent(SpeedValue):
  """
  Speed as a percentage of the motor's maximum rated speed.
  Returns Tacho Counts via motor.max_speed
  """
  def __init__(self, percent):
    if -100 <= percent <= 100:
      self.percent = percent
    else:
      raise ValueError("Value must be between -100 and 100")

  def __str__(self):
    return str(self.percent) + '%'

  def __mul__(self,other):
    if isinstance(other, (float, int)):
      return SpeedPercent(self.percent * other)
    else:
      raise TypeError("Multiplier must be of int or float type.")

  def to_native_units(self, motor):
    return self.percent / 100.0 * motor.max_speed


class SpeedNativeUnits(SpeedValue):
  """
  Speed in tacho counts per second
  Returns no. of Tacho Counts
  """
  def __init__(self,native_counts):
    self.native_counts = native_counts

  def __str__(self):
    return str(self.native_counts) + "counts/sec"

  def __mul__(self, other):
    if isinstance(other, (float, int)):
      SpeedNativeUnits(self.native_counts * other)
    else:
      raise TypeError("Multiplier must be of int or float type.")

  def to_native_units(self,motor):
    return self.native_counts


class SpeedRPS(SpeedValue):
  """
  Speed in rotations-per-second
  Returns Tacho Counts via motor.max_rps
  """
  def __init__(self, rotations_per_second):
    self.rotations_per_second = rotations_per_second

  def __str__(self):
    return str(self.rotations_per_second) + " rot/sec"

  def __mul__(self, other):
    if isinstance(other, (float, int)):
      return SpeedRPS(self.rotations_per_second * other)
    else:
      raise TypeError("Multiplier must be of float or int type")

  def to_native_units(self, motor):
    if abs(self.rotations_per_second) <= motor.max_rps:
      return self.rotations_per_second/motor.max_rps * motor.max_speed
    else:
      raise ValueError("RPS value must be <= motor.max_rps")


class SpeedRPM(SpeedValue):
  """
  Speed in rotations-per-minute
  Returns RPM to Tacho Counts via motor.max_rpm
  """

  def __init__(self, rotations_per_minute):
    self.rotations_per_minute = rotations_per_minute

  def __str__(self):
    return str(self.rotations_per_minute) + " rot/min"

  def __mul__(self, other):
    if isinstance(other, (float, int)):
      return SpeedRPM(self.rotations_per_minute * other)
    else:
      raise TypeError("Multiplier must be of type float or int")

  def to_native_units(self, motor):
    if abs(self.rotations_per_minute) <= motor.max_rpm:
      return self.rotations_per_minute/motor.max_rpm * motor.max_speed
    else:
      raise ValueError("RPM Value must be <= motor.max_rpm")


class SpeedDPS(SpeedValue):
  """
  Speed in degrees-per-second.
  Converts to Tacho Counts via motor.max_dps
  """

  def __init__(self, degrees_per_second):
    self.degrees_per_second = degrees_per_second

  def __str__(self):
    return str(self.degrees_per_second) + " deg/sec"

  def __mul__(self, other):
    if isinstance(other, (float, int)):
      return SpeedDPS(self.degrees_per_second * other)
    else:
      raise TypeError("Multiplier must be of type float or int")

  def to_native_units(self, motor):
    if abs(self.degrees_per_second) <= motor.max_dps:
      return self.degrees_per_second/motor.max_dps * motor.max_speed
    else:
      raise ValueError("DPS Value must be <= motor.max_dps")


class SpeedDPM(SpeedValue):
  """
  Speed in degrees-per-min
  Returns Tacho Counts via motor.max_dpm
  """

  def __init__(self, degrees_per_minute):
    self.degrees_per_minute = degrees_per_minute

  def __str__(self):
    return str(self.degrees_per_minute) + " deg/min"

  def __mul__(self, other):
    if isinstance(other, (float, int)):
      return SpeedDPM(self.degrees_per_minute * other)
    else:
      raise TypeError("Multiplier must be of type float or int")

  def to_native_units(self, motor):
    if abs(self.degrees_per_minute) <= motor.max_dpm:
      return self.degrees_per_minute/motor.max_dpm * motor.max_speed
    else:
      raise ValueError("DPM Value must be <= motor.max_dpm")

class Motor:
  COMMAND_RESET = 'reset'
  COMMAND_RUN_DIRECT = 'run-direct'
  COMMAND_RUN_FOREVER = 'run-forever'
  COMMAND_RUN_TIMED = 'run-timed'
  COMMAND_RUN_TO_ABS_POS = 'run-to-abs-pos'
  COMMAND_RUN_TO_REL_POS = 'run-to-rel-pos'
  COMMAND_STOP = 'stop'
  ENCODER_POLARITY_INVERSED = 'inversed'
  ENCODER_POLARITY_NORMAL = 'normal'
  POLARITY_INVERSED = 'inversed'
  POLARITY_NORMAL = 'normal'
  STATE_HOLDING = 'holding'
  STATE_OVERLOADED = 'overloaded'
  STATE_RAMPING = 'ramping'
  STATE_RUNNING = 'running'
  STATE_STALLED = 'stalled'
  STOP_ACTION_BRAKE = 'brake'
  STOP_ACTION_COAST = 'coast'
  STOP_ACTION_HOLD = 'hold'

  _DRIVER_NAME = None

  def __init__(self, address=None):
    self.wheel = simPython.Motor(address)

    self.max_speed = 1050
    self.count_per_rot = 360
    self.max_rps = float(self.max_speed/self.count_per_rot)
    self.max_rpm = self.max_rps * 60
    self.max_dps = self.max_rps * 360
    self.max_dpm = self.max_rpm * 360

  @property
  def command(self):
    raise Exception("command is a write-only property!")

  @command.setter
  def command(self, value):
    self.wheel.command(value)
    return 0

  @property
  def duty_cycle(self):
    return self.wheel.speed()

  @property
  def duty_cycle_sp(self):
    return self._duty_cycle_sp

  @duty_cycle_sp.setter
  def duty_cycle_sp(self, value):
    self._duty_cycle_sp = value
    self.wheel.speed_sp(int(value))
    return 0

  @property
  def is_holding(self):
    return self.STATE_HOLDING in self.wheel.state()

  @property
  def is_overloaded(self):
    return self.STATE_OVERLOADED in self.wheel.state()

  @property
  def is_ramping(self):
    return self.STATE_RAMPING in self.wheel.state()

  @property
  def is_running(self):
    return self.STATE_RUNNING in self.wheel.state()

  @property
  def is_stalled(self):
    return self.STATE_STALLED in self.wheel.state()

  @property
  def polarity(self):
    return self.wheel.polarity()

  @polarity.setter
  def polarity(self, value):
    self.wheel.polarity(value)
    return 0

  @property
  def position(self):
    time.sleep(SENSOR_DELAY)
    return int(self.wheel.position())

  @position.setter
  def position(self, value):
    self.wheel.position(int(value))
    return 0

  @property
  def position_d(self):
    return 1

  @position_d.setter
  def position_d(self, value):
    return 0

  @property
  def position_i(self):
    return 1

  @position_i.setter
  def position_i(self, value):
    return 0

  @property
  def position_p(self):
    return 1

  @position_p.setter
  def position_p(self, value):
    return 0

  @property
  def position_sp(self):
    return self.wheel.position_sp()

  @position_sp.setter
  def position_sp(self, value):
    self.wheel.position_sp(int(value))
    return 0

  @property
  def ramp_down_sp(self):
    return 1

  @ramp_down_sp.setter
  def ramp_down_sp(self, value):
    return 0

  @property
  def ramp_up_sp(self):
    return 1

  @ramp_up_sp.setter
  def ramp_up_sp(self, value):
    return 0

  @property
  def speed(self):
    time.sleep(SENSOR_DELAY)
    return int(self.wheel.speed())

  @property
  def speed_d(self):
    return 1

  @speed_d.setter
  def speed_d(self, value):
    return 0

  @property
  def speed_i(self):
    return 1

  @speed_i.setter
  def speed_i(self, value):
    return 0

  @property
  def speed_p(self):
    return 1

  @speed_p.setter
  def speed_p(self, value):
    return 0

  @property
  def speed_sp(self):
    return self.wheel.speed_sp()

  @speed_sp.setter
  def speed_sp(self, value):
    self.wheel.speed_sp(int(value))
    return 0

  @property
  def state(self):
    return self.wheel.state()

  @property
  def stop_action(self):
    return self.wheel.stop_action()

  @stop_action.setter
  def stop_action(self, value):
    self.wheel.stop_action(value)
    return 0

  @property
  def time_sp(self):
    return self.wheel.speed_sp()

  @time_sp.setter
  def time_sp(self, value):
    self.wheel.time_sp(value)
    return 0

  def reset(self, **kwargs):
    """
    Resets the motor the default value. It will also stop the motor.
    """
    for k in kwargs:
      setattr(self, k, kwargs[k])
    self.command = 'reset'

  def run_direct(self, **kwargs):
    """
    Run the motor at the duty cycle specified by duty_cycle_sp.
    Unlike other run commands, changing duty_cycle_sp
    while running will take effect immediately.
    """
    for k in kwargs:
      setattr(self, k, kwargs[k])

  def run_forever(self, **kwargs):
    """
    Run the motor until another command is sent.
    """
    for k in kwargs:
      setattr(self, k, kwargs[k])
    self.command = 'run-forever'

  def run_timed(self, **kwargs):
    """
    Run for the amount of time specified in time_sp.
    Then, stop the motor as specified by stop_action.
    """
    for k in kwargs:
      setattr(self, k, kwargs[k])
    self.command = 'run-timed'

  def run_to_abs_pos(self, **kwargs):
    """
    Run to the absolute position as specified by position_sp.
    Then, stop the motor as specified by stop_action.
    """
    for k in kwargs:
      setattr(self, k, kwargs[k])
    self.command = 'run-to-abs-pos'

  def run_to_rel_pos(self, **kwargs):
    """
    Run to the relative position as specified by position_sp.
    New position will be current position + position_sp
    When the new position is reached, the motor will stop, as specified
    by stop_action.
    """
    for k in kwargs:
      setattr(self, k, kwargs[k])
    self.command = 'run-to-rel-pos'

  def stop(self, **kwargs):
    """
    Stop any of the run commands before they are complete using the
    action specified by stop_action.
    """
    for k in kwargs:
      setattr(self, k, kwargs[k])
    self.command = ''

  def wait(self, cond, timeout=None):
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
      if cond(str(self.wheel.state())):
        return True
      if timeout != None and time.clock() >= timeout:
        return False

  def wait_until(self, s, timeout=None):
    """
    Blocks until ``s`` is in ``self.state``.  The condition is checked when
    there is an I/O event related to the ``state`` attribute.  Exits early
    when ``timeout`` (in milliseconds) is reached.

    Returns ``True`` if the condition is met, and ``False`` if the timeout
    is reached.

    Example::
        m.wait_until('stalled')
    """
    return self.wait(lambda state: s in state, timeout)

  def wait_until_not_moving(self, timeout=None):
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
    return self.wait(lambda state: (self.STATE_RUNNING not in state and self.STATE_RAMPING not in state) or self.STATE_STALLED in state, timeout)

  def wait_while(self, s, timeout=None):
    """
    Blocks until ``s`` is not in ``self.state``.  The condition is checked
    when there is an I/O event related to the ``state`` attribute.  Exits
    early when ``timeout`` (in milliseconds) is reached.

    Returns ``True`` if the condition is met, and ``False`` if the timeout
    is reached.

    Example::

        m.wait_while('running')
    """
    return self.wait(lambda state: s not in state, timeout)

  def _set_rel_position_degrees_and_speed_sp(self, degrees, speed):
    degrees = degrees if speed >= 0 else -degrees
    speed = abs(speed)

    position_delta = int(round((degrees * self.count_per_rot)/360))
    speed_sp = int(round(speed))

    self.position_sp = position_delta
    self.speed_sp = speed_sp

  def on_for_rotations(self, speed, rotations, brake=True, block=True):
    """
    Rotate the motor at ``speed`` for ``rotations``

    ``speed`` can be a percentage or a :class:`ev3dev2.motor.SpeedValue`
    object, enabling use of other units.
    """
    if not isinstance(speed, SpeedValue):
      if -100 <= speed <= 100:
        speed = SpeedPercent(speed)
        speed_sp = speed.to_native_units(self)
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      speed_sp = int(round(speed.to_native_units(self)))

    self._set_rel_position_degrees_and_speed_sp(rotations*360, speed_sp)

    if brake:
      self.stop_action = self.STOP_ACTION_HOLD
    else:
      self.stop_action = self.STOP_ACTION_COAST

    self.run_to_rel_pos()

    if block:
      self.wait_until('running', timeout=WAIT_RUNNING_TIMEOUT)
      self.wait_until_not_moving()

  def on_for_degrees(self, speed, degrees, brake=True, block=True):
    """
    Rotate the motor at ``speed`` for ``degrees``

    ``speed`` can be a percentage or a :class:`ev3dev2.motor.SpeedValue`
    object, enabling use of other units.
    """
    if not isinstance(speed, SpeedValue):
      if -100 <= speed <= 100:
        speed = SpeedPercent(speed)
        speed_sp = speed.to_native_units(self)
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      speed_sp = int(round(speed.to_native_units(self)))

    self._set_rel_position_degrees_and_speed_sp(degrees, speed_sp)

    if brake:
      self.stop_action = self.STOP_ACTION_HOLD
    else:
      self.stop_action = self.STOP_ACTION_COAST

    self.run_to_rel_pos()

    if block:
      self.wait_until('running', timeout=WAIT_RUNNING_TIMEOUT)
      self.wait_until_not_moving()

  def on_to_position(self, speed, position, brake=True, block=True):
    """
    Rotate the motor at ``speed`` to ``position``

    ``speed`` can be a percentage or a :class:`ev3dev2.motor.SpeedValue`
    object, enabling use of other units.
    """
    if not isinstance(speed, SpeedValue):
      if -100 <= speed <= 100:
        speed = SpeedPercent(speed)
        speed_sp = speed.to_native_units(self)
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      speed_sp = int(round(speed.to_native_units(self)))

    self.speed_sp = int(round(speed_sp))
    self.position_sp = position

    if brake:
      self.stop_action = self.STOP_ACTION_HOLD
    else:
      self.stop_action = self.STOP_ACTION_COAST

    self.run_to_abs_pos()

    if block:
      self.wait_until('running', timeout=WAIT_RUNNING_TIMEOUT)
      self.wait_until_not_moving()

  def on_for_seconds(self, speed, seconds, brake=True, block=True):
    """
    Rotate the motor at ``speed`` for ``seconds``

    ``speed`` can be a percentage or a :class:`ev3dev2.motor.SpeedValue`
    object, enabling use of other units.
    """
    if seconds < 0:
      raise ValueError("Seconds is negative.")

    if not isinstance(speed, SpeedValue):
      if -100 <= speed <= 100:
        speed = SpeedPercent(speed)
        speed_sp = speed.to_native_units(self)
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      speed_sp = int(round(speed.to_native_units(self)))

    self.speed_sp = int(round(speed_sp))
    self.time_sp = seconds

    if brake:
      self.stop_action = self.STOP_ACTION_HOLD
    else:
      self.stop_action = self.STOP_ACTION_COAST

    self.run_timed()

    if block:
      self.wait_until('running', timeout=WAIT_RUNNING_TIMEOUT)
      self.wait_until_not_moving()

  def on(self, speed, brake=True, block=False):
    if not isinstance(speed, SpeedValue):
      if -100 <= speed <= 100:
        speed = SpeedPercent(speed)
        speed_sp = speed.to_native_units(self)
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      speed_sp = int(round(speed.to_native_units(self)))

    self.speed_sp = int(round(speed_sp))

    if brake:
      self.stop_action = self.STOP_ACTION_HOLD
    else:
      self.stop_action = self.STOP_ACTION_COAST

    self.run_forever()

    if block:
      self.wait_until('running', timeout=WAIT_RUNNING_TIMEOUT)
      self.wait_until_not_moving()

  def off(self, brake=True):

    if brake:
      self.stop_action = self.STOP_ACTION_HOLD
    else:
      self.stop_action = self.STOP_ACTION_COAST

    self.stop()


class LargeMotor(Motor):
  _DRIVER_NAME = 'lego-ev3-l-motor'


class MediumMotor(Motor):
  _DRIVER_NAME = 'lego-ev3-m-motor'


class MotorSet:
  def __init__(self, motor_specs, desc=None):
    self.motors = {}
    for motor_port in motor_specs.keys():
      motor_class = motor_specs[motor_port]
      self.motors[motor_port] = motor_class(motor_port)
      self.motors[motor_port].reset()
    self.desc = desc
    self.WAIT_RUNNING_TIMEOUT = 100

  def off(self, motors=None, brake=True):
    motors = motors if motors is not None else self.motors.values()

    for motor in motors:
      motor.stop_action = motor.STOP_ACTION_HOLD if brake else motor.STOP_ACTION_COAST

    for motor in motors:
      motor.stop()

  def stop(self, motors=None, brake=True):
    self.off(motors, brake)

  def _block(self):
    for motor in self.motors.values():
      motor.wait_until('running', timeout=WAIT_RUNNING_TIMEOUT)
      motor.wait_until_not_moving()

class MoveTank(MotorSet):
  def __init__(self, left_motor_port, right_motor_port, desc=None, motor_class=LargeMotor):
    motor_specs = {
      left_motor_port : motor_class,
      right_motor_port : motor_class,
      }
    MotorSet.__init__(self, motor_specs, desc)
    self.left_motor = self.motors[left_motor_port]
    self.right_motor = self.motors[right_motor_port]
    self.max_speed = self.left_motor.max_speed

  def on_for_degrees(self, left_speed, right_speed, degrees, brake=True, block=True):
    """
    Rotate the motors at 'left_speed' and 'right_speed' for 'degrees'.
    Speeds can be percentages or any SpeedValue implementation.

    If the left speed is not equal to the right speed (i.e., the robot will
    turn), the motor on the outside of the turn will rotate for the full
    ``degrees`` while the motor on the inside will have its requested
    distance calculated according to the expected turn.
    """
    if not isinstance(left_speed, SpeedValue):
      if -100 <= left_speed <= 100:
        left_speed_obj = SpeedPercent(left_speed)
        left_speed_var = int(round(left_speed_obj.to_native_units(self.left_motor)))
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      left_speed_var = int(round(left_speed.to_native_units(self.left_motor)))

    if not isinstance(right_speed, SpeedValue):
      if -100 <= right_speed <= 100:
        right_speed_obj = SpeedPercent(right_speed)
        right_speed_var = int(round(right_speed_obj.to_native_units(self.right_motor)))
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      right_speed_var = int(round(right_speed.to_native_units(self.right_motor)))

    if degrees == 0 or (left_speed_var == 0 and right_speed_var == 0):
      left_degrees = 0
      right_degrees = 0
    elif abs(left_speed_var) > abs(right_speed_var):
      left_degrees = degrees
      right_degrees = abs(right_speed_var / float(left_speed_var)) * degrees
    else:
      left_degrees = abs(left_speed_var / float(right_speed_var)) * degrees
      right_degrees = degrees

    left_degrees_in = round((left_degrees * self.left_motor.count_per_rot) / 360.0)
    right_degrees_in = round((right_degrees * self.right_motor.count_per_rot) / 360.0)

    self.left_motor.position_sp = left_degrees_in if left_speed_var >= 0 else -left_degrees_in
    self.left_motor.speed_sp = abs(left_speed_var)
    self.right_motor.position_sp = right_degrees_in if right_speed_var >= 0 else -right_degrees_in
    self.right_motor.speed_sp = abs(right_speed_var)

    self.left_motor.stop_action = self.left_motor.STOP_ACTION_HOLD if brake else self.left_motor.STOP_ACTION_COAST
    self.right_motor.stop_action = self.right_motor.STOP_ACTION_HOLD if brake else self.right_motor.STOP_ACTION_COAST

    self.left_motor.run_to_rel_pos()
    self.right_motor.run_to_rel_pos()

    if block:
      self._block()

  def on_for_rotations(self, left_speed, right_speed, rotations, brake=True, block=True):
    """
    Rotate the motors at 'left_speed' and 'right_speed' for 'rotations'.
    Speeds can be percentages or any SpeedValue implementation.

    If the left speed is not equal to the right speed (i.e., the robot will
    turn), the motor on the outside of the turn will rotate for the full
    ``rotations`` while the motor on the inside will have its requested
    distance calculated according to the expected turn.
    """
    MoveTank.on_for_degrees(self, left_speed, right_speed, rotations * 360, brake, block)

  def on_for_seconds(self, left_speed, right_speed, seconds, brake=True, block=True):
    """
    Rotate the motors at 'left_speed & right_speed' for 'seconds'.
    Speeds can be percentages or any SpeedValue implementation.
    """
    if seconds < 0:
      raise ValueError("Seconds is negative.")

    if not isinstance(left_speed, SpeedValue):
      if -100 <= left_speed <= 100:
        left_speed_obj = SpeedPercent(left_speed)
        left_speed_var = int(round(left_speed_obj.to_native_units(self.left_motor)))
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      left_speed_var = int(round(left_speed.to_native_units(self.left_motor)))


    if not isinstance(right_speed, SpeedValue):
      if -100 <= right_speed <= 100:
        right_speed_obj = SpeedPercent(right_speed)
        right_speed_var = int(round(right_speed_obj.to_native_units(self.right_motor)))
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      right_speed_var = int(round(right_speed.to_native_units(self.right_motor)))

    self.left_motor.speed_sp = left_speed_var
    self.left_motor.time_sp = seconds
    self.right_motor.speed_sp = right_speed_var
    self.right_motor.time_sp = seconds

    self.left_motor.stop_action = self.left_motor.STOP_ACTION_HOLD if brake else self.left_motor.STOP_ACTION_COAST
    self.right_motor.stop_action = self.right_motor.STOP_ACTION_HOLD if brake else self.right_motor.STOP_ACTION_COAST

    self.left_motor.run_timed()
    self.right_motor.run_timed()

    if block:
      self._block()

  def on(self, left_speed, right_speed):
    """
    Start rotating the motors according to ``left_speed`` and ``right_speed`` forever.
    Speeds can be percentages or any SpeedValue implementation.

    """
    if not isinstance(left_speed, SpeedValue):
      if -100 <= left_speed <= 100:
        left_speed_obj = SpeedPercent(left_speed)
        left_speed_var = int(round(left_speed_obj.to_native_units(self.left_motor)))
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      left_speed_var = int(round(left_speed.to_native_units(self.left_motor)))

    if not isinstance(right_speed, SpeedValue):
      if -100 <= right_speed <= 100:
        right_speed_obj = SpeedPercent(right_speed)
        right_speed_var = int(round(right_speed_obj.to_native_units(self.right_motor)))
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      right_speed_var = int(round(right_speed.to_native_units(self.right_motor)))

    self.left_motor.speed_sp = left_speed_var
    self.right_motor.speed_sp = right_speed_var
    self.left_motor.run_forever()
    self.right_motor.run_forever()


class MoveSteering(MoveTank):
  def get_speed_steering(self, steering, speed):
    if steering > 100 or steering < -100:
      raise ValueError("Invalid Steering Value. Between -100 and 100 (inclusive).")

    # Assumes left motor's speed stats are the same as the right motor's
    if not isinstance(speed, SpeedValue):
      if -100 <= speed <= 100:
        speed_obj = SpeedPercent(speed)
        speed_var = speed_obj.to_native_units(self.left_motor)
      else:
        raise Exception("Invalid Speed Percentage. Speed must be between -100 and 100)")
    else:
      speed_var = speed.to_native_units(self.left_motor)

    left_speed = speed_var
    right_speed = speed_var
    speed_factor = (50 - abs(float(steering))) / 50.0

    if steering >= 0:
      right_speed *= speed_factor
    else:
      left_speed *= speed_factor

    return(left_speed, right_speed)

  def on_for_rotations(self, steering, speed, rotations, brake=True, block=True):
    """
    Rotate the motors according to the provided ``steering``.

    The distance each motor will travel follows the rules of :meth:`MoveTank.on_for_rotations`.
    """
    (left_speed, right_speed) = self.get_speed_steering(steering, speed)
    MoveTank.on_for_rotations(self, SpeedNativeUnits(left_speed), SpeedNativeUnits(right_speed), rotations, brake, block)

  def on_for_degrees(self, steering, speed, degrees, brake=True, block=True):
    """
    Rotate the motors according to the provided ``steering``.

    The distance each motor will travel follows the rules of :meth:`MoveTank.on_for_degrees`.
    """
    (left_speed, right_speed) = self.get_speed_steering(steering, speed)
    MoveTank.on_for_degrees(self, SpeedNativeUnits(left_speed), SpeedNativeUnits(right_speed), degrees, brake, block)

  def on_for_seconds(self, steering, speed, seconds, brake=True, block=True):
    """
    Rotate the motors according to the provided ``steering`` for ``seconds``.
    """
    (left_speed, right_speed) = self.get_speed_steering(steering, speed)
    MoveTank.on_for_seconds(self, SpeedNativeUnits(left_speed), SpeedNativeUnits(right_speed), seconds, brake, block)

  def on(self, steering, speed):
    """
    Start rotating the motors according to the provided ``steering`` and
    ``speed`` forever.
    """
    (left_speed, right_speed) = self.get_speed_steering(steering, speed)
    MoveTank.on(self, SpeedNativeUnits(left_speed), SpeedNativeUnits(right_speed))