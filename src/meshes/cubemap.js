function Cubemap(name) {

    this.name = name;
    this.shader;
    this.vertices = [];
    this.indices = [];
    this.texture = new CubemapTexture(512, 512, name);

    this.vao;
    this.vbo;

    this.isReady = false;

    this.createCube = function() {

        var addVertex = function(vector, x, y, z) {
            vector.push(x);
            vector.push(y);
            vector.push(z);
        }

        // RIGHT
        addVertex(this.vertices,  1.0, -1.0, -1.0);
        addVertex(this.vertices,  1.0, -1.0,  1.0);
        addVertex(this.vertices,  1.0,  1.0,  1.0);
        addVertex(this.vertices,  1.0,  1.0, -1.0);
        // LEFT
        addVertex(this.vertices, -1.0,  1.0,  1.0);
        addVertex(this.vertices, -1.0, -1.0,  1.0);
        addVertex(this.vertices, -1.0, -1.0, -1.0);
        addVertex(this.vertices, -1.0,  1.0, -1.0);
        // TOP
        addVertex(this.vertices, -1.0,  1.0,  1.0);
        addVertex(this.vertices, -1.0,  1.0, -1.0);
        addVertex(this.vertices,  1.0,  1.0, -1.0);
        addVertex(this.vertices,  1.0,  1.0,  1.0);
        // BOTTOM
        addVertex(this.vertices, -1.0, -1.0, -1.0);
        addVertex(this.vertices, -1.0, -1.0,  1.0);
        addVertex(this.vertices,  1.0, -1.0,  1.0);
        addVertex(this.vertices,  1.0, -1.0, -1.0);
        // FRONT
        addVertex(this.vertices, -1.0,  1.0, -1.0);
        addVertex(this.vertices, -1.0, -1.0, -1.0);
        addVertex(this.vertices,  1.0, -1.0, -1.0);
        addVertex(this.vertices,  1.0,  1.0, -1.0);
        // BACK
        addVertex(this.vertices,  1.0,  1.0,  1.0);
        addVertex(this.vertices,  1.0, -1.0,  1.0);
        addVertex(this.vertices, -1.0, -1.0,  1.0);
        addVertex(this.vertices, -1.0,  1.0,  1.0);

        var f = 0;
        for (var i = 0; i < 6; i++) {
            this.indices = this.indices.concat([f + 0, f + 1, f + 3, f + 3, f + 1, f + 2]);
            f += 4;
        }
    }

    this.setupCubemap = function() {

        this.createCube();

        // -- Setup buffers --
        this.vao = new VertexArray();

        // VertexBuffer to store vertex positions
        this.vbo = new VertexBuffer(new Float32Array(this.vertices), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        // IndexBuffer to store vertex indices
        this.ebo = new IndexBuffer(new Uint8Array(this.indices), gl.STATIC_DRAW);

        this.vao.unbind();

        this.isReady = true;
    }

    this.shader = Shader.getShader("skybox");
    this.setupCubemap();

    this.render = function(camera) {
        if (this.isReady && this.texture.isReady) {
            this.shader.enable();
            this.shader.setMatrix4("u_view", camera.view.clearTranslation());
            this.shader.setMatrix4("u_projection", camera.projection);

            this.shader.setInt("u_skybox", 0)
            gl.activeTexture(gl.TEXTURE0);
            this.texture.bind();

            this.vao.bind();
            gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_BYTE, 0);
            this.vao.unbind();

            this.shader.disable();
        }
    }
}
