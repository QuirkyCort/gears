import simPython

# The pen only draws when it is down.  Therefore, if you do not import
# the pen and call pen.down(), then no trace will ever be drawn
class Pen:
    """
    A pen class for drawing a line showing the path of the robot.
    To use, create a Pen object and call Pen.down().
    The pen starts in the up position after each simulator reset.
    The pen only draws when it is down.
    """

    def __init__(self):
        self.pen = simPython.Pen()

    def down(self):
        """
        Begin drawing a pen trace.
        """
        self.pen.down()

    def up(self):
        """
        Finish drawing a pen trace.  Robot movement while the pen is up
        will not cause a trace to be drawn.
        """
        self.pen.up()

    def isDown(self):
        # TODO, untested , may require conversion from java obj to python
        return self.pen.isDown()
        
    def setColor(self, r=0.5,g=0.5,b=0.5):
        """
        Set the color of the current pen trace.  rgb values should be in the 
        range [0,1].  If called after pen down(), will affect the trace 
        from the down() point.
        """
        for channel_val, c_name in [(r, 'red'), (g, 'green'), (b, 'blue')]:
            if channel_val < 0.0 or channel_val > 1.0:
                raise ValueError('{} color channel must be in range [0,1]',
                                 c_name)
        self.pen.setColor(r, g, b)

    # orientation in ["horizontal", 'h', "vertical", 'v']    
    def setOrientation(self, orientation='horizontal'):
        """
        Set the pen orientation.  Supported orientations are
          "horizontal" (or 'h'): pen trace flat on table plane.
          "vertical" (or 'v'): pen trace perpendicular to table plane.
        The default is "horizontal"
        """
        supportedOrientations = ('horizontal', 'vertical')
        isValid = False
        for sO in supportedOrientations:
            if sO.startswith(orientation):
                isValid = True
                break
        if not isValid:
            raise ValueError('orientation must be one of ' + str(supportedOrientations))
        self.pen.setOptions( {'orientation': orientation} )

    def setAnimate(self, animMode='animate'):
        """
        Set the animation mode.  Supported modes are
          "animate" : pen trace is redrawn as the robot moves
          "onUp" : pen trace for each down/up segment is drawn after up()
          "onFinish" : all pen traces are drawn after the python program 
            completes
          "none" : the pen is disabled / no traces are drawn.
        The default is "animate".  Changing the animation mode after the 
        first pen down() may result in strange behavior.
        """
        supportedAnimModes = ['animate', 'onUp', 'onFinish', 'none']
        if animMode not in supportedAnimModes:
            raise ValueError('animMode must be one of ' + str(supportedAnimModes))
        self.pen.setOptions( { 'animate': animMode } )

    def setWidth(self, width=1.0):
        """
        Set the pen trace width in cm.  The default width is 1.0
        """
        self.pen.setOptions( { 'width': width } )
        
