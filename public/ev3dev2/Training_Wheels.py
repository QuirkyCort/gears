import math

class Training_Wheels:
    def __init__(self, gps, gyro, steering_drive):
        self.gps = gps
        self.gyro = gyro
        self.steering_drive = steering_drive
        self.dir = self.gyro.angle
        self.x = self.gps.x
        self.y = self.gps.y

    def _get_vec_length(self, vec):
        return math.sqrt(vec[0] ** 2 + vec[1] ** 2)

    def _get_unit_vec(self, vec):
        length = self._get_vec_length(vec)
        return (vec[0] / length, vec[1] / length)

    def _constrain(self, in_val, min_val=-100, max_val=100):
        if in_val < min_val:
            return min_val
        elif in_val > max_val:
            return max_val
        else:
            return in_val

    def _dot(self, vec1, vec2):
        return vec1[0] * vec2[0] + vec1[1] * vec2[1]

    def fwd_cm(self, cm):
        base_dir = -self.dir + 90
        dir_vec = self._get_unit_vec((math.cos(base_dir / 180.0 * math.pi), math.sin(base_dir / 180.0 * math.pi)))
        nor_vec = (dir_vec[1], -dir_vec[0])

        while True:
            pos_vec = (self.gps.x - self.x, self.gps.y - self.y)
            error = self._dot(pos_vec, nor_vec)
            correction = -10 * error
            distance_travelled = self._dot(pos_vec, dir_vec)
            speed = 25
            if distance_travelled < 5:
                speed = 5 + distance_travelled * 4
            if distance_travelled > cm - 5:
                distance_remaining = cm - distance_travelled
                speed = 5 + distance_remaining * 4
            if distance_travelled >= cm:
                break
            self.steering_drive.on(self._constrain(correction, -10, 10), speed)
        self.steering_drive.off(brake=True)
        self.x = cm * math.cos(base_dir / 180.0 * math.pi) + self.x
        self.y = cm * math.sin(base_dir / 180.0 * math.pi) + self.y

    def rev_cm(self, cm):
        base_dir = -self.dir + 90
        dir_vec = self._get_unit_vec((math.cos(base_dir / 180.0 * math.pi), math.sin(base_dir / 180.0 * math.pi)))
        nor_vec = (dir_vec[1], -dir_vec[0])

        while True:
            pos_vec = (self.gps.x - self.x, self.gps.y - self.y)
            error = self._dot(pos_vec, nor_vec)
            correction = -10 * error
            distance_travelled = -self._dot(pos_vec, dir_vec)
            speed = 25
            if distance_travelled < 5:
                speed = 5 + distance_travelled * 4
            if distance_travelled > cm - 5:
                distance_remaining = cm - distance_travelled
                speed = 5 + distance_remaining * 4
            if distance_travelled >= cm:
                break
            self.steering_drive.on(self._constrain(correction, -10, 10), -speed)
        self.steering_drive.off(brake=True)
        self.x = -cm * math.cos(base_dir / 180.0 * math.pi) + self.x
        self.y = -cm * math.sin(base_dir / 180.0 * math.pi) + self.y

    def spin_right(self, dir):
        while True:
            current_dir = self.gyro.angle
            speed = 25
            if current_dir - self.dir < 20:
                speed = 5 + (current_dir - self.dir) * 1
            if current_dir > dir - 40:
                angle_remaining = dir - current_dir
                speed = 1 + angle_remaining * 0.5
            if current_dir >= dir:
                break
            self.steering_drive.on(100, speed)
        self.steering_drive.off(brake=True)

    def spin_left(self, dir):
        while True:
            current_dir = self.gyro.angle
            speed = 25
            if current_dir - self.dir > -20:
                speed = 5 + -(current_dir - self.dir) * 1
            if current_dir < dir + 40:
                angle_remaining = dir - current_dir
                speed = 1 + -angle_remaining * 0.5
            if current_dir <= dir:
                break
            self.steering_drive.on(-100, speed)
        self.steering_drive.off(brake=True)

    def spin_to(self, dir):
        if dir > self.gyro.angle:
            self.spin_right(dir)
            self.dir = dir
        elif dir < self.gyro.angle:
            self.spin_left(dir)
            self.dir = dir

    def turn_left(self):
        self.spin_to(self.dir - 90)

    def turn_right(self):
        self.spin_to(self.dir + 90)