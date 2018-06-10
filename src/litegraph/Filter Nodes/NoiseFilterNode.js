//node constructor class
function NoiseFilterNode() {

    this.addInput("Heightmap");
    this.addInput("Frequency");
    this.addInput("Amplitude");
    this.addOutput("Heightmap");

}

//name to show
NoiseFilterNode.title = "Noise Filter";
NoiseFilterNode.position = [10, 50];
NoiseFilterNode.size = [300, 50];

//function to call when the node is executed
NoiseFilterNode.prototype.onExecute = function() {

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return
    } else {
        this.heighmapOBJ = Object.assign({}, heightmapOBJ);
    }

    this.frequency = this.getInputData(1);
    if (this.frequency === undefined)
        this.frequency = 1.0;

    this.amplitude = this.getInputData(2);
    if (this.amplitude === undefined)
        this.amplitude = 1.0;

    var self = this;

    var setFilterUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboFilter.shader.setFloat("u_frequency", self.frequency);
        self.fboFilter.shader.setFloat("u_amplitude", self.amplitude);
    }

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    var filterTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboFilter = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, filterTexture, "noiseFilter", setFilterUniformsCallback);

    this.fboFilter.render();

    this.heighmapOBJ.heightmapTexture = filterTexture;

    this.setOutputData(0, this.heighmapOBJ);
}

//register in the system
LiteGraph.registerNodeType("heightmap/noiseFilter", NoiseFilterNode);
