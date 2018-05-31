//node constructor class
function OutputNode() {

    this.addInput("Heightmap");
    this.addOutput("Heightmap");

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

    var setColorUniformsCallback = function() {
        self.fboColor.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboColor.shader.setFloat("u_size", self.heighmapOBJ.size);
        self.fboColor.shader.setFloat("u_heightScale", self.heighmapOBJ.heightScale);
    }

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    this.heighmapOBJ.normalsTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboNormals = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.normalsTexture.textureId, "calcNormals", setNormalsUniformsCallback);

    this.fboNormals.render();

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    this.heighmapOBJ.colorTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboColor = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.colorTexture.textureId, "calcColor", setColorUniformsCallback);

    this.fboColor.render();

    // Display texture in editor
    var img = this.fboNormals.toImage();
    var htmlImg = document.getElementById("normalsTex");
    htmlImg.src = img.src;

    this.setOutputData(0, this.heighmapOBJ);
}

//register in the system
LiteGraph.registerNodeType("heightmap/heightmapOutput", OutputNode);
