function Camera() {

    // Orthographic parameters
    this.right;
    this.left;
    this.bottom;
    this.top;

    // Perspective parameters
    this.fov;
    this.aspect;

    // Common parameters
    this.zNear;
    this.zFar;

    // For view matrix
    this.eye = new vec3(0.0, 0.0, 0.0);
    this.center;
    this.up = new vec3(0.0, 1.0, 0.0);

    this.front = new vec3(0.0, 0.0, 0.0);

    // How the camara is projected and the point of view
    this.projection;
    this.view;
    // Multiplication of the above matrices
    this.vp;
}

Camera.prototype.setOrtho = function(left, right, bottom, top, zNear, zFar) {
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
    this.zNear = zNear;
    this.zFar = zFar;

    this.projection = mat4.ortho(left, right, bottom, top, zNear, zFar);
}

Camera.prototype.setPerspective = function(fov, aspect, zNear, zFar) {
    this.fov = fov;
    this.aspect = aspect;
    this.zNear = zNear;
    this.zFar = zFar;

    this.projection = mat4.perspective(fov, aspect, zNear, zFar);
}

Camera.prototype.setViewport = function(x, y, width, height) {
    gl.viewport(x, y, width, height);
}

Camera.prototype.setEyeUp = function(eye, up) {
    this.eye = eye;
    this.up = up;
}

Camera.prototype.setView = function(eye, front, up) {
    this.eye = eye;
    this.front = vec3.vec3Normalize(front);
    this.up = up;

    this.view = mat4.lookAt(eye, vec3.vec3Add(this.eye, this.front), up);
}

Camera.prototype.addYawPitch = function(yaw, pitch) {
    this.yaw += yaw;
    this.pitch += pitch;

    if (this.pitch > 89.0)
        this.pitch = 89.0;
    if (this.pitch < -89.0)
        this.pitch = -89.0;

    this.front.x = Math.cos(Math.toRadians(this.pitch)) * Math.cos(Math.toRadians(this.yaw));
    this.front.y = Math.sin(Math.toRadians(this.pitch));
    this.front.z = Math.cos(Math.toRadians(this.pitch)) * Math.sin(Math.toRadians(this.yaw));

    this.setView(this.eye, this.front, this.up);
}

Camera.prototype.setYawPitch = function(yaw, pitch) {
    this.yaw = yaw;
    this.pitch = pitch;

    this.front.x = Math.cos(Math.toRadians(pitch)) * Math.cos(Math.toRadians(yaw));
    this.front.y = Math.sin(Math.toRadians(pitch));
    this.front.z = Math.cos(Math.toRadians(pitch)) * Math.sin(Math.toRadians(yaw));

    this.setView(this.eye, this.front, this.up);
}

Camera.prototype.update = function() {
    this.setView(this.eye, this.front, this.up);
    this.vp = mat4.matrixMultiplication(this.projection, this.view);
}
