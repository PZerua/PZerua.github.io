class mat4 {

    constructor(value) {

        value = value || 0;

        this.m = [

            value, 0, 0, 0,
            0, value, 0, 0,
            0, 0, value, 0,
            0, 0, 0, value

        ];
    }

    reset() {
        for (var i = 0; i < 16; i++) {
            this.elements[i] = 0;
        }
    }

    clone() {
        var matClone = new mat4()
        return matClone.fromArray(this.m);
    }

    add(mat) {
        for(var i = 0; i < 16; i++) {
            this.m[i] += mat[i];
        }
    }

    sub(mat) {
        for(var i = 0; i < 16; i++) {
            this.m[i] -= mat[i];
        }
    }

    multiply(mat) {
        for (var row = 0; row < 4; row++)
            for (var e = 0; e < 4; e++)
                for (var col = 0; col < 4; col++)
                    this.m[row + col * 4] += left.m[row + e * 4] * right.m[e + col * 4];
    }

    static matrixMultiplication(a, b) {
        var mat = new mat4();

        for (var row = 0; row < 4; row++)
            for (var e = 0; e < 4; e++)
                for (var col = 0; col < 4; col++)
                    mat.m[row + col * 4] += a.m[row + e * 4] * b.m[e + col * 4];

        return mat;
    }

    fromArray(array) {
        for (var i = 0; i < 16; i++) {
            this.m[i] = array[i];
        }
        return this;
    }

    setTranslation(x, y, z) {
        this.m[0 + 3 * 4] = x;
        this.m[1 + 3 * 4] = y;
        this.m[2 + 3 * 4] = z;
    }

    clearTranslation() {
        var mat = this.clone();

        mat.m[0 + 3 * 4] = 0.0;
        mat.m[1 + 3 * 4] = 0.0;
        mat.m[2 + 3 * 4] = 0.0;

        // mat.m[3 + 0 * 4] = 0.0;
        // mat.m[3 + 1 * 4] = 0.0;
        // mat.m[3 + 2 * 4] = 0.0;

        mat.m[3 + 3 * 4] = 1.0;

        return mat;
    }

    setRotation(angle, x, y, z) {
        var c = Math.cos(Math.toRadians(angle));
        var s = Math.sin(Math.toRadians(angle));
        var cmo = 1.0 - c;

        this.m[0 + 0 * 4] = c + x * x * cmo;
        this.m[1 + 0 * 4] = y * x * cmo + z * s;
        this.m[2 + 0 * 4] = z * x * cmo - y * s;

        this.m[0 + 1 * 4] = x * y * cmo - z * s;
        this.m[1 + 1 * 4] = c + y * y * cmo;
        this.m[2 + 1 * 4] = z * y * cmo + x * s;

        this.m[0 + 2 * 4] = x * z * cmo + y * s;
        this.m[1 + 2 * 4] = y * z * cmo - x * s;
        this.m[2 + 2 * 4] = c + z * z * cmo;

        this.m[3 + 3 * 4] = 1;
    }

    setScale(x, y, z) {
        this.m[0 + 0 * 4] = x;
        this.m[1 + 1 * 4] = y;
        this.m[2 + 2 * 4] = z;
    }

    static translationMatrix(x, y, z) {
        var mat = new mat4(1.0);
        mat.setTranslation(x, y, z);
        return mat;
    }

    static rotationMatrix(angle, x, y, z) {
        var mat = new mat4(1.0);
        mat.setRotation(angle, x, y, z);
        return mat;
    }

    static scaleMatrix(x, y, z) {
        var mat = new mat4(1.0);
        mat.setScale(x, y, z);
        return mat;
    }

    static ortho(left, right, bottom, top, nearZ, farZ) {
        var mat = new mat4(1.0);

        mat.m[0 + 0 * 4] = 2.0 / (right - left);
        mat.m[1 + 1 * 4] = 2.0 / (top - bottom);
        mat.m[2 + 2 * 4] = -2.0 / (farZ - nearZ);
        mat.m[0 + 3 * 4] = -(right + left) / (right - left);
        mat.m[1 + 3 * 4] = -(top + bottom) / (top - bottom);
        mat.m[2 + 3 * 4] = -(farZ + nearZ) / (farZ - nearZ);

        return mat;
    }

    static perspective(fov, aspect, nearZ, farZ) {
        var mat = new mat4();

        var q = 1.0 / Math.tan(fov / 2.0);

        mat.m[0 + 0 * 4] = q / aspect;
        mat.m[1 + 1 * 4] = q;
        mat.m[2 + 2 * 4] = (farZ + nearZ) / (nearZ - farZ);
        mat.m[3 + 2 * 4] = -1.0;
        mat.m[2 + 3 * 4] = 2.0 * (farZ * nearZ) / (nearZ - farZ);

        return mat;
    }

    static lookAt(eye, center, up) {
        var mat = new mat4();

        var front = vec3.vec3Sub(center, eye);
        front.normalize();
        var right = front.cross(up);
        right.normalize();
        var top = right.cross(front);
        top.normalize();

        mat.m[0 + 0 * 4] = right.x;
        mat.m[0 + 1 * 4] = right.y;
        mat.m[0 + 2 * 4] = right.z;
        mat.m[0 + 3 * 4] = -right.dot(eye);
        mat.m[1 + 0 * 4] = top.x;
        mat.m[1 + 1 * 4] = top.y;
        mat.m[1 + 2 * 4] = top.z;
        mat.m[1 + 3 * 4] = -top.dot(eye);
        mat.m[2 + 0 * 4] = -front.x;
        mat.m[2 + 1 * 4] = -front.y;
        mat.m[2 + 2 * 4] = -front.z;
        mat.m[2 + 3 * 4] = front.dot(eye);
        mat.m[3 + 3 * 4] = 1.0;

        return mat;
    }

    print() {

        var str = "";

        for (var col = 0; col < 4; col++) {
            str += "|";

            for (var row = 0; row < 4; row++)
                str += this.m[col + row * 4].toString() + " ";

            str += "|\n";
        }

        console.log(str);
    }
}
