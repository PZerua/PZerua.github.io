class FrameBuffer {

    constructor(width, height, texture, shaderName, setUniformsCallback) {

        if (setUniformsCallback) {
            this.setUniforms = setUniformsCallback;
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

        // VertexBuffer to store vertex positions
        this.vboUvs = new VertexBuffer(new Float32Array(uvs), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        // IndexBuffer to store vertex indices
        this.ebo = new IndexBuffer(new Uint8Array(indices), gl.STATIC_DRAW);

        this.vao.unbind();

        this.shader = Shader.getShader(shaderName);
    }

    bind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbId);
    }

    unbind() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    toImage() {

        this.bind();

        // Read the contents of the framebuffer
        var pixels = new Uint8Array(this.width * this.height * 4 );
        var a = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE);
        var b = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT);
        gl.readPixels(0, 0, this.width, this.height, this.texture.internalFormat, this.texture.type, pixels);

        this.unbind();

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
        img.src = canvas.toDataURL();
        return img;
    }

    render() {
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
}
