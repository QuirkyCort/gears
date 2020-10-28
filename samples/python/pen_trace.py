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
# This sample demonstrates how to use the pen to show a trace of where the
# robot has been.
from ev3dev2.pen import *

tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)

pen = Pen()
# This call dynamically adds a pen to the robot if it does not already have one.
# If it does have a pen, no pen is added.
pen.addPen()

colors = [(1,0,0), (0,1,0), (0,0,1), (0.5, 0, 0.5)]
orientations = ['h', 'v', 'h', 'v']

sides = 5
full_turn_time = 10

# 'animate' is the default.  Try 'onUp' and 'onFinish' for other effects.
pen.setAnimate('animate')

# Drive in an n-gon like shape
for i in range(sides):
    pen.setColor(*colors[i%4])
    # The pen can either draw a line on the surface ('h', 'horizontal'),
    #  or a line vertical to the surface ('v', 'vertical'). 'h' is the default.
    pen.setOrientation(orientations[i%4])
    pen.setWidth(i+1)
    pen.down()
    tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(30), 14./sides)

    tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(-30), 0.7)
    pen.up()

# Drive away from the n-gon in an arc
pen.setColor(*colors[0])
pen.setOrientation('v')
pen.setWidth(1)
pen.down()
tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(50), 3)
# If you omit the last pen.up() call, the robot still draws the last trace.
