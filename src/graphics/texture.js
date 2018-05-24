class Texture {

    constructor(width, height, internalFormat, format, type, data) {

        this.width = width;
        this.height = height;

        this.textureId = gl.createTexture();
        this.bind();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type,  null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.unbind();
    }

    updateTexture(data) {
        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, gl.R32F, gl.FLOAT, data);
    }

    bind() {
        gl.bindTexture(gl.TEXTURE_2D, this.textureId);
    }

    unbind() {
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
