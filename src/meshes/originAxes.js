function OriginAxes() {

    this.shader;
    this.vertices = [];
    this.colors = [];

    this.vao;
    this.vbo;
    this.vboColors;

    this.isReady = false;

    var self = this;

    this.createAxes = function() {

        // X axis
        self.vertices.push(0);
        self.vertices.push(0);
        self.vertices.push(0);

        self.vertices.push(1);
        self.vertices.push(0);
        self.vertices.push(0);

        self.colors.push(1);
        self.colors.push(0);
        self.colors.push(0);

        self.colors.push(1);
        self.colors.push(0);
        self.colors.push(0);

        // Y axis
        self.vertices.push(0);
        self.vertices.push(0);
        self.vertices.push(0);

        self.vertices.push(0);
        self.vertices.push(1);
        self.vertices.push(0);

        self.colors.push(0);
        self.colors.push(1);
        self.colors.push(0);

        self.colors.push(0);
        self.colors.push(1);
        self.colors.push(0);

        // Z axis
        self.vertices.push(0);
        self.vertices.push(0);
        self.vertices.push(0);

        self.vertices.push(0);
        self.vertices.push(0);
        self.vertices.push(1);

        self.colors.push(0);
        self.colors.push(0);
        self.colors.push(1);

        self.colors.push(0);
        self.colors.push(0);
        self.colors.push(1);
    }

    this.setupAxes = function() {

        self.createAxes();

        // -- Setup buffers --
        self.vao = new VertexArray();

        // VertexBuffer to store vertex positions
        self.vbo = new VertexBuffer(new Float32Array(self.vertices), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // VertexBuffer to store vertex positions
        self.vboColors = new VertexBuffer(new Float32Array(self.colors), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

        // IndexBuffer to store vertex indices
        //self.ebo = new IndexBuffer(new Uint16Array(self.indices), gl.STATIC_DRAW);

        self.vao.unbind();

        self.isReady = true;
    }

    this.shader = new Shader("axes", this.setupAxes);

    this.render = function(camera) {
        if (this.isReady) {
            this.vao.bind();
            gl.useProgram(this.shader.programId);
            this.shader.setMatrix4("u_mvp", camera.vp);
            gl.drawArrays(gl.LINES, 0, 6);
            this.vao.unbind();
        }
    }
}
