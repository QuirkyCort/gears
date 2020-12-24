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
radio = Radio()

color_sensor_in1 = ColorSensor(INPUT_1)
ultrasonic_sensor_in2 = UltrasonicSensor(INPUT_2)
gyro_sensor_in3 = GyroSensor(INPUT_3)
gps_sensor_in4 = GPSSensor(INPUT_4)
pen_in5 = Pen(INPUT_5)

motorC = LargeMotor(OUTPUT_C) # Magnet

# Here is where your code starts

# This sample demonstrates how to use the pen to show a trace of where the
# robot has been.
pen_in5.down()

colors = [(1,0,0), (0,1,0), (0,0,1), (0.5, 0, 0.5)]

sides = 5
full_turn_time = 10

# Drive in an n-gon like shape
for i in range(sides):
    pen_in5.setColor(*colors[i%4])
    pen_in5.setWidth(i+1)
    tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(30), 14./sides)
    tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(-30), 0.7)

# Drive away from the n-gon in an arc
pen_in5.setColor(*colors[0])
pen_in5.setWidth(1)
tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(50), 3)
