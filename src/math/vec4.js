class vec4 {

    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    set(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    reset() {
        this.set(0, 0, 0, 0);
    }

    clone() {
        var vec = new vec4(this.x, this.y, this.z, this.w);
        return vec;
    }

    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        this.w += vec.w;
    }

    sub(vec) {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        this.w += vec.w;
    }

    static vec4Add(a, b) {
        var vec = new vec4();
        vec.x = a.x + b.x;
        vec.y = a.y + b.y;
        vec.z = a.z + b.z;
        vec.w = a.w + b.w;
        return vec;
    }

    static vec4Sub(a, b) {
        var vec = new vec4();
        vec.x = a.x - b.x;
        vec.y = a.y - b.y;
        vec.z = a.z - b.z;
        vec.w = a.w - b.w;
        return vec;
    }

    dot(vec) {
         return (this.x * vec.x + this.y * vec.y + this.z * vec.z + this.w * vec.w);
    }

    get length() {
        return Math.sqrt(this.x  *this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        this.w *= scalar;
    }
}
