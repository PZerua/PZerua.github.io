//node constructor class
function ValueNoiseNode() {

    this.addInput("Size", "number");
    this.addInput("Amplitude", "number");
    this.addInput("Frequency", "number");
    this.addInput("Octaves", "number");
    this.addInput("Height Scale", "number");
    this.addOutput("Heightmap");

    this.heighmapOBJ = {
        heightmapTexture: undefined,
        normalsTexture: undefined,
        colorTexture: undefined,
        size: 0,
        heightScale: 0
    }
}

//name to show
ValueNoiseNode.title = "Value Noise";
ValueNoiseNode.position = [10, 50];
ValueNoiseNode.size = [300, 50];

//function to call when the node is executed
ValueNoiseNode.prototype.onExecute = function() {

    // Receive size
    this.heighmapOBJ.size = this.getInputData(0);
    if (this.heighmapOBJ.size === undefined)
        this.heighmapOBJ.size = 1024;

    // Receive amplitude
    this.amplitude = this.getInputData(1);
    if (this.amplitude === undefined)
        this.amplitude = 1;

    // Receive frequency
    this.frequency = this.getInputData(2);
    if (this.frequency === undefined)
        this.frequency = 3;

    // Receive octaves
    this.octaves = this.getInputData(3);
    if (this.octaves === undefined)
        this.octaves = 8;

    // Receive mesh height scale
    this.heighmapOBJ.heightScale = this.getInputData(4);
    if (this.heighmapOBJ.heightScale === undefined)
        this.heighmapOBJ.heightScale = 200;

    // Define custom uniforms for the framebuffer's shader
    var self = this;
    var setHeightmapUniformsCallback = function() {
        self.fboHeightmap.shader.setFloat("u_frequency", self.frequency);
        self.fboHeightmap.shader.setFloat("u_amplitude", self.amplitude);
        self.fboHeightmap.shader.setInt("u_octaves", self.octaves);
    }

    // --- Create heightmap and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    this.heighmapOBJ.heightmapTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboHeightmap = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.heightmapTexture, "valueNoise", setHeightmapUniformsCallback);

    this.fboHeightmap.render();

    this.setOutputData(0, this.heighmapOBJ);
}

//register in the system
LiteGraph.registerNodeType("heightmap/valueNoise", ValueNoiseNode);
