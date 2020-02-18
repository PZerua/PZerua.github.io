class FrameBuffer {

    constructor(width, height, texture, shaderName, uniformsCallback) {

        if (uniformsCallback) {
            this.setUniforms = uniformsCallback;
        } else {
            this.setUniforms = function() {}
        }

        this.height = height;
        this.width = width;
        this.texture = texture;

        this.fbId = gl.createFramebuffer();
        this.bind();
        // Assign texture to framebuffer
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.textureId, 0);
        this.unbind();

        // Quad vertices
        var vertices = [ -1.0,  1.0,
                         -1.0, -1.0,
                          1.0, -1.0,
                          1.0,  1.0];

        var uvs = [  0.0, 1.0,
                     0.0, 0.0,
                     1.0, 0.0,
                     1.0, 1.0];

        var indices = [0, 1, 2, 0, 2, 3];

        // -- Setup buffers --
        this.vao = new VertexArray();

        // VertexBuffer to store vertex positions
        this.vbo = new VertexBuffer(new Float32Array(vertices), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        // VertexBuffer to store uvs
        this.vboUvs = new VertexBuffer(new Float32Array(uvs), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        // IndexBuffer to store vertex indices
        this.ebo = new IndexBuffer(new Uint8Array(indices), gl.STATIC_DRAW);

        this.vao.unbind();

        if (shaderName) {
            this.shader = Shader.getShader(shaderName);
        }
    }

    bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbId);
    }

    unbind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    setShader(shaderName) {
        this.shader = Shader.getShader(shaderName);
    }

    setTexture(texture) {
        this.texture = texture
        this.bind();
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.textureId, 0);
        this.unbind();
    }

    toImage() {

        var tmpTexture = new Texture(this.width, this.height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
        var tmpFBO = new FrameBuffer(this.width, this.height, tmpTexture);

        gl.bindFramebuffer (gl.DRAW_FRAMEBUFFER, tmpFBO.fbId );
        gl.bindFramebuffer (gl.READ_FRAMEBUFFER, this.fbId );
        gl.readBuffer ( gl.COLOR_ATTACHMENT0 );
        gl.blitFramebuffer(0, 0, this.width, this.height, 0, 0, this.width, this.height, gl.COLOR_BUFFER_BIT, gl.NEAREST);

        tmpFBO.bind();

        // Read the contents of the framebuffer
        var pixels = new Uint8Array(this.width * this.height * 4);
        gl.readPixels(0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        tmpTexture.unbind();
        tmpTexture.delete();

        tmpFBO.unbind();

        // Create a 2D canvas to store the result
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        var context = canvas.getContext('2d');

        // Copy the pixels to a 2D canvas
        var imageData = context.createImageData(this.width, this.height);
        imageData.data.set(pixels);
        context.putImageData(imageData, 0, 0);

        var img = new Image();
        img.onload = function () {
          Editor.graphCanvas.draw(true, true);
        };
        img.src = canvas.toDataURL();
        return img;
    }

    render() {

        if (!this.shader) {
            console.error("No shader specified in framebuffer")
            return;
        }

        this.bind();
        gl.viewport(0, 0, this.width, this.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.shader.enable();
        this.setUniforms();
        this.vao.bind();
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
        this.vao.unbind();
        this.shader.disable();
        this.unbind();
    }

    setUniformsCallback(uniformsCallback) {
        if (uniformsCallback) {
            this.setUniforms = uniformsCallback;
        } else {
            this.setUniforms = function() {}
        }
    }
}
