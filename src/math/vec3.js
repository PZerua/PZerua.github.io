class vec3 {

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    reset() {
        this.set(0, 0, 0);
    }

    clone() {
        var vec = new vec3(this.x, this.y, this.z);
        return vec;
    }

    add(otherVector) {
        this.x += otherVector.x;
        this.y += otherVector.y;
        this.z += otherVector.z;
    }

    sub(otherVector) {
        this.x -= otherVector.x;
        this.y -= otherVector.y;
        this.z -= otherVector.z;
    }

    static vec3Add(a, b) {
        var vec = new vec3();
        vec.x = a.x + b.x;
        vec.y = a.y + b.y;
        vec.z = a.z + b.z;
        return vec;
    }

    static vec3Sub(a, b) {
        var vec = new vec3();
        vec.x = a.x - b.x;
        vec.y = a.y - b.y;
        vec.z = a.z - b.z;
        return vec;
    }

    normalize() {
        var length = this.length;

        this.x /= length;
        this.y /= length;
        this.z /= length;

        return this;
    }

    static vec3Normalize(a) {
        return a.clone().normalize();
    }

    dot(vec) {
         return (this.x * vec.x + this.y * vec.y + this.z * vec.z);
    }

    cross(vec) {
        return new vec3(this.y * vec.z - vec.y * this.z,
            vec.x * this.z - this.x * vec.z, this.x * vec.y - vec.x * this.y);
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;
    }
}
