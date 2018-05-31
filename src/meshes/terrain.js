function Terrain(scale) {

    this.shader;
    this.scale = scale;
    this.firstCreation = true;

    this.vao;
    this.vbo;
    this.vboUvs;
    this.vboBarycentric;
    this.vboNormals;
    this.vboHeightmap;
    this.ebo;
    this.showWireframe = 0;

    this.isReady = false;

    var self = this;

    this.buildTerrain = function() {
        var minX = Infinity;
        var minY = Infinity;
        var minZ = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var maxZ = -Infinity;

        self.vertices = [];
        self.uvs = [];
        self.barycentricBuffer = [];
        self.indices = [];
        self.heightmap = [];
        self.heightmapHeightScale = 0;
        self.heightmapTexture = undefined;
        self.normalsTexture = undefined;

        // Get heightmap from output node TODO: This is probably not the best way to do it
        var heightmapOBJ = Editor.outputNode.getOutputData(0);

        self.heightmapTexture = heightmapOBJ.heightmapTexture;
        self.normalsTexture = heightmapOBJ.normalsTexture;
        self.colorTexture = heightmapOBJ.colorTexture;
        self.size = heightmapOBJ.size;
        self.heightmapHeightScale = heightmapOBJ.heightScale;

        // -- Create the grid --
        // Store vertices
        for (var height = -self.size/2; height < self.size/2; height++) {
            for (var width = -self.size/2; width < self.size/2; width++) {
                // Add vertex
                self.vertices.push(width * self.scale);    // x
                self.vertices.push(0);                     // y
                self.vertices.push(height * self.scale);   // z

                self.uvs.push((width + self.size / 2) / self.size);
                self.uvs.push((height + self.size / 2) / self.size);
            }
        }

        // Face camera to mesh
        // TODO: Review this
        self.center = new vec3(self.size / 2.0, 0, self.size / 2.0);
        self.radious = Math.sqrt((self.center.x) * (self.center.x) + (self.center.z) * (self.center.z));

        // -- Barypoints --
        var currentBaryPoint = new vec3(1, 0, 0);
        var lastBaryPoint = new vec3(0, 0, 0);

        // Helper function
        function nextBaryPoint(baryPoint) {
            if (baryPoint.x)
                baryPoint.set(0, 1, 0);
            else if (baryPoint.y)
                baryPoint.set(0, 0, 1);
            else if (baryPoint.z)
                baryPoint.set(1, 0, 0);
        }

        // Store barycentric points used for wireframe
        for (var i = 0; i < self.size; i++) {
            for (var j = 0; j < self.size; j++) {
                lastBaryPoint = currentBaryPoint.clone();
                self.barycentricBuffer.push(currentBaryPoint.x);
                self.barycentricBuffer.push(currentBaryPoint.y);
                self.barycentricBuffer.push(currentBaryPoint.z);
                nextBaryPoint(currentBaryPoint);
            }
            if ((self.size + 1) % 3 == 1)
            {
                currentBaryPoint = lastBaryPoint;
            }
            else if ((self.size + 1) % 3 == 2)
            {
                nextBaryPoint(currentBaryPoint);
            }
        }

        // They should have the same length
        var delta = self.barycentricBuffer.length - self.vertices.length;
        while (delta-- > 0) { self.barycentricBuffer.pop(); }

    	// Store indices
    	var row, col;
    	for (row = 0; row < self.size - 1; row++) {

            if (row != 0 && row != self.size -1)
                self.indices.push(row * self.size);
        	// Generate indices for Triangle Strip rendering
        	for (col = 0; col < self.size; col++) {
                self.indices.push(col + row * self.size);
                self.indices.push(col + (row + 1) * self.size);
        	}
        	// Generate degenerated triangles to change row
        	if (col == self.size && row < self.size - 1) {
                self.indices.push((col - 1) + (row + 1) * self.size);
        	}
    	}

        self.firstCreation = false;
    }

    this.setupTerrain = function() {

        self.buildTerrain();

        // -- Setup buffers --
        self.vao = new VertexArray();

        // VertexBuffer to store vertex positions
        self.vbo = new VertexBuffer(new Float32Array(self.vertices), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // VertexBuffer to store uvs
        self.vboUvs = new VertexBuffer(new Float32Array(self.uvs), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        // VertexBuffer to store barycentric positions (for wireframe rendering)
        self.vboBarycentric = new VertexBuffer(new Float32Array(self.barycentricBuffer), gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        // IndexBuffer to store vertex indices
        self.ebo = new IndexBuffer(new Uint32Array(self.indices), gl.STATIC_DRAW);

        self.vao.unbind();

        self.isReady = true;
    }

    this.shader = Shader.getShader("terrain");
    this.setupTerrain();

    this.render = function(camera) {
        if (this.isReady) {
            this.vao.bind();
            this.shader.enable();

            this.shader.setMatrix4("u_mvp", camera.vp);
            this.shader.setFloat("u_heightmapScale", this.heightmapHeightScale);
            this.shader.setInt("u_showWireframe", this.showWireframe)

            // Set heightmap and normals textures
            this.shader.setInt("u_heightmapTexture", 0)
            gl.activeTexture(gl.TEXTURE0);
            this.heightmapTexture.bind();
            this.shader.setInt("u_normalsTexture", 1)
            gl.activeTexture(gl.TEXTURE1);
            this.normalsTexture.bind();
            this.shader.setInt("u_colorTexture", 2)
            gl.activeTexture(gl.TEXTURE2);
            this.colorTexture.bind();

            // Used for lightning
            this.shader.setVec3("u_eye", camera.eye);
            this.shader.setMatrix4("u_view", camera.view);

            gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_INT, 0);
            this.shader.disable();
            this.vao.unbind();
        }
    }
}
