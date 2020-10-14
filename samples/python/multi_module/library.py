from ev3dev2.sound import Sound

def say_hello(name='E V 3'):
    sound = Sound()
    print('saying hello to', name)
    sound.speak('hello {}'.format(name))
