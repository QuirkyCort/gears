#!/usr/bin/env python3

# Import the necessary libraries
import time
import math
from ev3dev2.motor import *
from ev3dev2.sound import Sound
from ev3dev2.sensor import *
from ev3dev2.sensor.lego import *
from ev3dev2.sensor.virtual import *

# Create the sensors and motors objects
motorA = LargeMotor(OUTPUT_A)
motorB = LargeMotor(OUTPUT_B)
left_motor = motorA
right_motor = motorB
tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)
steering_drive = MoveSteering(OUTPUT_A, OUTPUT_B)

spkr = Sound()

color_sensor_in1 = ColorSensor(INPUT_1)
ultrasonic_sensor_in2 = UltrasonicSensor(INPUT_2)
gyro_sensor_in3 = GyroSensor(INPUT_3)
gps_sensor_in4 = GPSSensor(INPUT_4)

motorC = LargeMotor(OUTPUT_C) # Magnet

# Here is where your code starts

# You don't need to conditionalize the pen, this is just so you can turn
# it on and off to experiment
use_pen = True
if use_pen:
    from ev3dev2.pen import *

tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)

if use_pen:
    pen = Pen()

colors = [(1,0,0), (0,1,0), (0,0,1), (0.5, 0, 0.5)]
orientations = ['h', 'v', 'h', 'v']

sides = 5
full_turn_time = 10

if use_pen:
    # the default animation mode is 'animate'.  Try 'onUp' and 'onFinish' to
    # see what happens.  This is designed to be called before the first
    # pen.down().  If you change the animation mode after pen.down(), strange
    # things may happen.
    pen.setAnimate('animate')

# drive in an n-gon like shape
for i in range(sides):
    if use_pen:
        pen.setColor(*colors[i%4])
        pen.setOrientation(orientations[i%4])
        pen.setWidth(i+1)
        pen.down()
    tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(30), 14./sides)

    tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(-30), 0.7)

    if use_pen:
        pen.up()

# drive away from the n-gon in an arc with the pen up / no trace   
tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(50), 3)

# now drive in an arc the other way with the pen down
if use_pen:
    pen.setColor(*colors[0])
    pen.setOrientation('v')
    pen.setWidth(1)
    pen.down()
tank_drive.on_for_seconds(SpeedPercent(50), SpeedPercent(30), 3)
# not doing pen_up here as a test that skipping it doesnt break the last pen trace
