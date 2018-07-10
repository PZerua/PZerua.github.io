function Terrain(scale) {

    this.shader;
    this.scale = scale;

    this.vao;
    this.vbo;
    this.vboUvs;
    this.vboBarycentric;
    this.ebo;
    this.showWireframe = 0;
    this.firstSetup = true;

    var self = this;

    this.buildTerrain = function() {

        // Instanciate buffers
        self.vertices = new Float32Array(self.size * self.size * 3);
        self.uvs = new Float32Array(self.size * self.size * 2);
        self.barycentricBuffer = new Float32Array(self.size * self.size * 3);
        self.indices = new Uint32Array(self.size * self.size * 2 - 3);

        // -- Create the grid --
        // Store vertices
        var counterVert = 0;
        var counterUvs = 0;
        for (var height = -self.size/2; height < self.size/2; height++) {
            for (var width = -self.size/2; width < self.size/2; width++) {
                // Add vertex
                self.vertices[counterVert++] = (width * self.scale);    // x
                self.vertices[counterVert++] = (0);                     // y
                self.vertices[counterVert++] = (height * self.scale);   // z

                self.uvs[counterUvs++] = ((width + self.size / 2) / self.size);
                self.uvs[counterUvs++] = ((height + self.size / 2) / self.size);
            }
        }

        // Face camera to mesh
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
        var counter = 0;
        for (var i = 0; i < self.size; i++) {
            for (var j = 0; j < self.size; j++) {
                lastBaryPoint = currentBaryPoint.clone();
                self.barycentricBuffer[counter++] = (currentBaryPoint.x);
                self.barycentricBuffer[counter++] = (currentBaryPoint.y);
                self.barycentricBuffer[counter++] = (currentBaryPoint.z);
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
        var counter = 0;
    	for (row = 0; row < self.size - 1; row++) {

            if (row != 0 && row != self.size - 1) {
                self.indices[counter++] = (row * self.size);
            }
        	// Generate indices for Triangle Strip rendering
        	for (col = 0; col < self.size; col++) {
                self.indices[counter++] = (col + row * self.size);
                self.indices[counter++] = (col + (row + 1) * self.size);
        	}
        	// Generate degenerated triangles to change row
        	if (col == self.size && row < self.size - 1) {
                self.indices[counter++] = ((col - 1) + (row + 1) * self.size);
        	}
    	}
    }

    this.setupTerrain = function() {

        var outputNode = Editor.graph.findNodesByTitle("Output")[0];

        if (outputNode) {
            var heightmapOBJ = outputNode.heighmapOBJ;
        } else {
            //console.error("No Output node in graph");
            return false;
        }

        if (!heightmapOBJ) {
            return;
        }

        self.heightmapTexture = heightmapOBJ.heightmapTexture;
        self.normalsTexture = heightmapOBJ.normalsTexture;
        self.colorTexture = heightmapOBJ.colorTexture;
        self.heightmapHeightScale = heightmapOBJ.heightScale;

        // Do not recalculate vertex data if the size is the same (only textures change)
        if (self.size === heightmapOBJ.size) {
            return;
        }

        self.size = heightmapOBJ.size;
        self.buildTerrain();

        if (this.firstSetup) {
            Editor.centerCamera();
            this.firstSetup = false;
        }

        // -- Setup buffers --
        self.vao = new VertexArray();

        // VertexBuffer to store vertex positions
        self.vbo = new VertexBuffer(self.vertices, gl.STATIC_DRAW);

        // The attribute position in the shader
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

        // VertexBuffer to store uvs
        self.vboUvs = new VertexBuffer(self.uvs, gl.STATIC_DRAW);

        // The attribute uvs in the shader
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

        // VertexBuffer to store barycentric positions (for wireframe rendering)
        self.vboBarycentric = new VertexBuffer(self.barycentricBuffer, gl.STATIC_DRAW);

        // The attribute barypoints in the shader
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 0, 0);

        // IndexBuffer to store vertex indices
        self.ebo = new IndexBuffer(self.indices, gl.STATIC_DRAW);

        self.vao.unbind();

        self.ready = true;
    }

    this.shader = Shader.getShader("terrain");
    this.setupTerrain();

    this.render = function(camera) {

        if (!this.ready) {
            return;
        }

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

        gl.drawElements(gl.TRIANGLE_STRIP, this.indices.length, gl.UNSIGNED_INT, 0);
        this.shader.disable();
        this.vao.unbind();
    }
}
