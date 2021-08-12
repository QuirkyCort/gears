Gears
===
Generic Educational Autonomous Robotics Simulator

This simulator was created to allow anyone to experiment with robotics without owning a robot.

Try it out at https://gears.aposteriori.com.sg

...or the latest version from github https://quirkycort.github.io/gears/public/

It uses the Ev3dev api (...and some early support for Pybricks), so the code can run on an actual Lego Mindstorm EV3 if you have one.

Installation
---

The simulator is meant to be served through a webserver, and we maintain the site at https://gears.aposteriori.com.sg free for anyone to use.

If you wish to run your own local copy, download all files and put them in a directory on your server and that should be it.
Due to CORS protection on web browsers, it will not work when served from a "file://" URL.

Without a Webserver
---

If you do not have a webserver, but have Python3 installed on your computer, you can try...

1. Download Gears from https://github.com/QuirkyCort/gears/archive/refs/heads/master.zip
2. Change to the "gears/public" directory
3. Run `python -m http.server 1337`
Do not close the window with the Python command running.

This should get the site running on http://localhost:1337 (...try http://127.0.0.1:1337 if that doesn't work).

The site may also be available to other users on the same network using http://your_IP_address:1337, where "your_IP_address" is replaced with your actual IP address.
This may not work depending on your network configuration and your firewall settings.

If you do not wish to allow other users from accessing the site, you should run `python -m http.server 1337 --bind 127.0.0.1` instead.

Credits
---
Created by A Posteriori (https://aposteriori.com.sg).

Other Contributors:

Steven Murray
* Football Arena
* ObjectTracker
* Improvements to magnet
* Wheel Actuators

humbug99
* Pen
* Multiple Python modules tabs

Yuvix25
* FLL Mission models

This simulator would not have been possible without the great people behind:

* Babylon.js https://babylonjs.org
* Blockly https://developers.google.com/blockly
* Skulpt https://skulpt.org
* Ace https://ace.c9.io
* Ammo.js https://github.com/kripken/ammo.js/ (port of Bullet https://pybullet.org/)

Translations by:

* Français: Sébastien CANET <scanet@libreduc.cc>
* Nederlands: Henry Romkes
* Ελληνικά: Eduact, https://eduact.org/en
* Español: edurobotic
* Deutsch: Annette-Gymnasiums-Team (Johanna,Jule,Felix), germanicianus
* Português: Mateus Lima

License
---
GNU General Public License v3.0

The following Open Source software are included here for convenience.
Please refer to their respective websites for license information.

* Babylon.js
* Blockly
* Ace Editor
* Skulpt
* Ammo.js
* Cannon.js
* Oimo.js
* Pep
* Jquery
* JSZip
