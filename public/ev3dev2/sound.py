import simPython, time

# Needed to prevent loops from locking up the javascript thread
SENSOR_DELAY = 0.001

class Sound:
  PLAY_WAIT_FOR_COMPLETE = 0
  PLAY_NO_WAIT_FOR_COMPLETE = 1
  PLAY_LOOP = 2

  def __init__(self, address=None):
    self.sound = simPython.Sound()

  def set_volume(self, pct):
    self.sound.set_volume(pct)

  def get_volume(self, pct):
    return self.sound.get_volume()

  def speak(self, text, espeak_opts='', volume=100, play_type=0):
    self.sound.set_volume(volume)
    if play_type == self.PLAY_NO_WAIT_FOR_COMPLETE:
      self.sound.speak(text)
    elif play_type == self.PLAY_WAIT_FOR_COMPLETE:
      self.sound.speak(text)
      while self.sound.isSpeaking():
        time.sleep(SENSOR_DELAY)
    elif play_type == self.PLAY_LOOP:
      while True:
        self.sound.speak(text)
        while self.sound.isSpeaking():
          time.sleep(SENSOR_DELAY)

  def play_tone(self, frequency, duration, delay=0.0, volume=100, play_type=0):
    self.sound.set_volume(volume)
    if play_type == self.PLAY_NO_WAIT_FOR_COMPLETE:
      self.sound.play_tone(frequency, duration, delay)
    elif play_type == self.PLAY_WAIT_FOR_COMPLETE:
      self.sound.play_tone(frequency, duration, delay)
      while self.sound.isPlaying():
        time.sleep(SENSOR_DELAY)
    elif play_type == self.PLAY_LOOP:
      while True:
        self.sound.play_tone(frequency, duration, delay)
        while self.sound.isPlaying():
          time.sleep(SENSOR_DELAY)

  def beep(self, args='', play_type=0):
    if play_type == self.PLAY_NO_WAIT_FOR_COMPLETE:
      self.sound.play_tone(440, 0.2, 0)
    elif play_type == self.PLAY_WAIT_FOR_COMPLETE:
      self.sound.play_tone(440, 0.2, 0)
      while self.sound.isPlaying():
        time.sleep(SENSOR_DELAY)
    elif play_type == self.PLAY_LOOP:
      while True:
        self.sound.play_tone(440, 0.2, 0)
        while self.sound.isPlaying():
          time.sleep(SENSOR_DELAY)