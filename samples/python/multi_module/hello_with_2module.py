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
from library import say_hello
from lib2 import write_hello, say_olleh

sound = Sound()
sound.speak('Welcome to the E V 3 dev project!')

say_hello('Cort')
say_olleh('Cort')
write_hello('Cort')

tank_drive = MoveTank(OUTPUT_A, OUTPUT_B)

# drive in a turn for 5 rotations of the outer motor
# the first two parameters can be unit classes or percentages.
#tank_drive.on_for_rotations(SpeedPercent(50), SpeedPercent(75), 10)

for i in range(4):
    # drive in a different turn for 3 seconds
    tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(30), 3)

    tank_drive.on_for_seconds(SpeedPercent(30), SpeedPercent(-30), 0.7)

