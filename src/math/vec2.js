class vec2 {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    reset() {
        this.set(0, 0);
    }

    clone() {
        var vec = new vec2(this.x, this.y, this);
        return vec;
    }

    add(otherVector) {
        this.x += otherVector.x;
        this.y += otherVector.y;
    }

    sub(vec) {
        this.x += vec.x;
        this.y += vec.y;
    }

    static vec2Add(a, b) {
        var vec = new vec2();
        vec.x = a.x + b.x;
        vec.y = a.y + b.y;
        return vec;
    }

    static vec2Sub(a, b) {
        var vec = new vec2();
        vec.x = a.x - b.x;
        vec.y = a.y - b.y;
        return vec;
    }

    dot(vec) {
         return (this.x * vec.x + this.y * vec.y);
    }

    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
    }
}
