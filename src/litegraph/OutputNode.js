//node constructor class
function OutputNode() {

    this.addInput("Heightmap");
    this.addOutput("Heightmap");

    this.heighmapOBJ = {
        heightmapTexture: undefined,
        normalsTexture: undefined,
        size: 0,
        heightScale: 0
    }
}

//name to show
OutputNode.title = "Output";
OutputNode.position = [10, 50];
OutputNode.size = [300, 50];

//function to call when the node is executed
OutputNode.prototype.onExecute = function() {

    // Receive size
    this.heighmapOBJ = this.getInputData(0);
    if (this.heighmapOBJ === undefined)
        return;

    var self = this;

    var setNormalsUniformsCallback = function() {
        self.fboNormals.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboNormals.shader.setFloat("u_size", self.heighmapOBJ.size);
        self.fboNormals.shader.setFloat("u_heightScale", self.heighmapOBJ.heightScale);
    }

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    this.heighmapOBJ.normalsTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA16F, gl.RGBA, gl.FLOAT, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboNormals = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.normalsTexture.textureId, "calcNormals", setNormalsUniformsCallback);

    this.setOutputData(0, this.heighmapOBJ);
}

//register in the system
LiteGraph.registerNodeType("heightmap/heightmapOutput", OutputNode);
