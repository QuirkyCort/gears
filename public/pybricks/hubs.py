import simPython
import time

# Needed to prevent loops from locking up the javascript thread
SENSOR_DELAY = 0.001

class EV3Brick:
  class Speaker:
    DEFAULT_DELAY = 0
    LONG_ENOUGH = 360000

    def __init__(self):
      self.sound = simPython.Sound()
      self.beep_volume = 100
      self.pcm_volume = 100

    def beep(self, frequency=500, duration=100):
      self.sound.set_volume(self.beep_volume)
      if duration < 0:
        self.sound.play_tone(frequency, self.LONG_ENOUGH, self.DEFAULT_DELAY)
      else:
        self.sound.play_tone(frequency, duration / 1000, self.DEFAULT_DELAY)
        while self.sound.isPlaying():
          time.sleep(SENSOR_DELAY)

    def say(self, text):
      self.sound.set_volume(self.pcm_volume)
      self.sound.speak(text)
      while self.sound.isSpeaking():
        time.sleep(SENSOR_DELAY)

    def set_volume(self, volume, which='_all_'):
      if which == '_all_' or which == 'Beep':
        self.beep_volume = volume
      
      if which == '_all_' or which == 'PCM':
        self.pcm_volume = volume

  class Buttons:
    def __init__(self):
      self._buttons = simPython.HubButtons()

    def pressed(self):
      time.sleep(SENSOR_DELAY)
      return self._buttons.pybricks_pressed()

  def __init__(self):
    self.speaker = self.Speaker()
    self.buttons = self.Buttons()

  