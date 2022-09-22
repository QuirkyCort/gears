import simPython
import time
from parameters import Direction, Stop

# Needed to prevent loops from locking up the javascript thread
SENSOR_DELAY = 0.001
PI = 3.141592653589793

class DriveBase:
  _MIN_STRAIGHT = 50
  _MIN_TURN = 5

  def __init__(self, left_motor, right_motor, wheel_diameter, axle_track):
    self.left_motor = left_motor
    self.right_motor = right_motor
    self.wheel_diameter = wheel_diameter
    self.axle_track = axle_track

    self.wheel_circumference = PI * wheel_diameter
    self.axle_circumference = PI * axle_track

    self.max_speed = left_motor._MAX_SPEED / 360 * self.wheel_circumference
    self.max_acceleration = left_motor._ABS_ACCELERATION / 360 * self.wheel_circumference
    self.max_turn = self.max_speed / self.axle_circumference * 360
    self.max_turn_acceleration = self.max_acceleration / self.axle_circumference * 360

    self.speed_sp = self.max_speed / 2
    self.speed_accel_sp = self.max_acceleration / 2
    self.turn_sp = self.max_turn / 2
    self.turn_accel_sp = self.max_turn_acceleration / 2

    self.left_base_angle = self.left_motor.angle()
    self.right_base_angle = self.right_motor.angle()

    self.drive_speed = 0
    self.turn_rate = 0

  def straight(self, distance):
    speed = 0
    target_angular_speed = self.speed_sp / self.wheel_circumference * 360
    end_angle = distance / self.wheel_circumference * 360
    end_angle_abs = abs(end_angle)
    left_target_angle = self.left_motor.angle() + end_angle
    right_target_angle = self.right_motor.angle() + end_angle
    start_angle = (self.left_motor.angle() + self.right_motor.angle()) / 2
    angular_acceleration = self.speed_accel_sp / self.wheel_circumference * 360

    ramp_angle = 0.5 * target_angular_speed ** 2 / angular_acceleration

    end_ramp_up_angle = ramp_angle
    start_ramp_down_angle = end_angle_abs - ramp_angle

    while True:
      time.sleep(SENSOR_DELAY)
      angle = (self.left_motor.angle() + self.right_motor.angle()) / 2 - start_angle
      if distance < 0:
        angle = -angle
      
      if angle >= end_angle_abs:
        break
      elif angle > start_ramp_down_angle:
        d = end_angle_abs - angle
        speed = angular_acceleration * (2 * d / angular_acceleration) ** 0.5
      elif angle > end_ramp_up_angle:
        speed = target_angular_speed
      else:
        d = angle
        if d < 0:
          d = 0
        speed = angular_acceleration * (2 * d / angular_acceleration) ** 0.5

      if speed < self._MIN_STRAIGHT:
        speed = self._MIN_STRAIGHT

      self.left_motor.run_target(speed, left_target_angle, then=Stop.COAST, wait=False)
      self.right_motor.run_target(speed, right_target_angle, then=Stop.COAST, wait=False)

    self.stop()

  def turn(self, angle):
    speed = 0
    target_angular_speed = (self.turn_sp / 360) * self.axle_circumference / self.wheel_circumference * 360
    end_angle = (angle / 360) * self.axle_circumference / self.wheel_circumference * 360
    end_angle_abs = abs(end_angle)

    left_start_angle = self.left_motor.angle()
    right_start_angle = self.right_motor.angle()

    left_target_angle = left_start_angle + end_angle
    right_target_angle = right_start_angle - end_angle

    angular_acceleration = (self.turn_accel_sp / 360) * self.axle_circumference / self.wheel_circumference * 360

    ramp_angle = 0.5 * target_angular_speed ** 2 / angular_acceleration

    end_ramp_up_angle = ramp_angle
    start_ramp_down_angle = end_angle_abs - ramp_angle

    while True:
      time.sleep(SENSOR_DELAY)
      if angle > 0:
        current_angle = ((self.left_motor.angle() - left_start_angle) - (self.right_motor.angle() - right_start_angle)) / 2
      else:
        current_angle = ((self.right_motor.angle() - right_start_angle) - (self.left_motor.angle() - left_start_angle)) / 2
      
      if current_angle >= end_angle_abs:
        break
      elif current_angle > start_ramp_down_angle:
        d = end_angle_abs - current_angle
        speed = angular_acceleration * (2 * d / angular_acceleration) ** 0.5
      elif current_angle > end_ramp_up_angle:
        speed = target_angular_speed
      else:
        d = current_angle
        if d < 0:
          d = 0
        speed = angular_acceleration * (2 * d / angular_acceleration) ** 0.5

      if speed < self._MIN_STRAIGHT:
        speed = self._MIN_STRAIGHT

      self.left_motor.run_target(speed, left_target_angle, then=Stop.COAST, wait=False)
      self.right_motor.run_target(speed, right_target_angle, then=Stop.COAST, wait=False)

    self.stop()

  def settings(self, straight_speed=None, straight_acceleration=None, turn_rate=None, turn_acceleration=None):
    if straight_speed == None and straight_acceleration == None and turn_rate == None and turn_acceleration == None:
      return (self.speed_sp, self.speed_accel_sp, self.turn_sp, self.turn_accel_sp)

    if straight_speed > self.max_speed:
      straight_speed = self.max_speed
    elif straight_speed < -self.max_speed:
      straight_speed = -self.max_speed

    if turn_rate > self.max_turn:
      turn_rate = self.max_turn
    elif turn_rate < -self.max_turn:
      turn_rate = -self.max_turn

    self.speed_sp = straight_speed
    self.speed_accel_sp = straight_acceleration
    self.turn_sp = turn_rate
    self.turn_accel_sp = turn_acceleration

  def drive(self, drive_speed, turn_rate):
    self.drive_speed = drive_speed
    self.turn_rate = turn_rate
    left_speed = drive_speed
    right_speed = drive_speed

    delta_speed = turn_rate / 360 * self.axle_circumference

    left_speed += delta_speed
    right_speed -= delta_speed

    self.left_motor.run(left_speed / self.wheel_circumference * 360)
    self.right_motor.run(right_speed / self.wheel_circumference * 360)

  def stop(self):
    self.left_motor.stop()
    self.right_motor.stop()

  def distance(self):
    average_angle = ((self.left_motor.angle() - self.left_base_angle) + (self.right_motor.angle() - self.right_base_angle)) / 2
    return average_angle / 360 * self.wheel_circumference

  def angle(self):
    delta_angle = (self.left_motor.angle() - self.left_base_angle) - (self.right_motor.angle() - self.right_base_angle)
    delta_dist = delta_angle / 2 / 360 * self.wheel_circumference
    return delta_dist / self.axle_circumference * 360

  def state(self):
    return (self.distance(), self.drive_speed, self.angle(), self.turn_rate)

  def reset(self):
    self.left_base_angle = self.left_motor.angle()
    self.right_base_angle = self.right_motor.angle()
