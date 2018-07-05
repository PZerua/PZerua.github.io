class CubemapTexture {

    constructor(width, height, name) {

        this.width = width;
        this.height = height;
        this.isReady = false;

        this.textureId = gl.createTexture();
        this.bind();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        var facesList = ["rt", "lf", "up", "dn", "ft", "bk"];
        var cubemapCounter = 0;
        var cubemapImages = [];
        var self = this;

        var onLoadCubemap = function() {
            if (++cubemapCounter < 6)
                return;

            self.bind();
            for (var i = 0; i < 6; i++) {
                gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cubemapImages[i]);
            }

            self.isReady = true;
        }

        for (var i = 0; i < 6; i++) {
            cubemapImages[i] = new Image();
            cubemapImages[i].onload = onLoadCubemap;
            cubemapImages[i].src = "data/skyboxes/" + name + "/" + name + "_" + facesList[i] + ".png";
        }

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        this.unbind();
    }

    bind() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.textureId);
    }

    unbind() {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
}
