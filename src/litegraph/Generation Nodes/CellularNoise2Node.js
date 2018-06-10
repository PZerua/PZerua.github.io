//node constructor class
function CellularNoise2Node() {

    this.addInput("Size", "number");
    this.addInput("Amplitude", "number");
    this.addInput("Frequency", "number");
    this.addInput("Octaves", "number");
    this.addInput("Height Scale", "number");
    this.addInput("Perturbation", "number");
    this.addInput("X Offset", "number");
    this.addInput("Y Offset", "number");

    this.addOutput("Heightmap");

    this.heighmapOBJ = {
        heightmapTexture: undefined,
        normalsTexture: undefined,
        colorTexture: undefined,
        size: 0,
        heightScale: 0
    }
}

//name to show and position
CellularNoise2Node.title = "Cellular Noise 2";

//function to call when the node is executed
CellularNoise2Node.prototype.onExecute = function() {

    // Receive size
    this.heighmapOBJ.size = this.getInputData(0);
    if (this.heighmapOBJ.size === undefined)
        this.heighmapOBJ.size = 1024;

    // Receive amplitude
    var amplitude = this.getInputData(1);
    if (amplitude === undefined)
        amplitude = 1;

    // Receive frequency
    frequency = this.getInputData(2);
    if (frequency === undefined)
        frequency = 3;

    // Receive octaves
    octaves = this.getInputData(3);
    if (octaves === undefined)
        octaves = 8;

    // Receive mesh height scale
    this.heighmapOBJ.heightScale = this.getInputData(4);
    if (this.heighmapOBJ.heightScale === undefined)
        this.heighmapOBJ.heightScale = 200;

    // Receive perturbation
    perturbation = this.getInputData(5);
    if (perturbation === undefined)
        perturbation = 0.0;

    // Receive x offset
    xOffset = this.getInputData(6);
    if (xOffset === undefined)
        xOffset = 0.0;

    // Receive y offset
    yOffset = this.getInputData(7);
    if (yOffset === undefined)
        yOffset = 0.0;

    // Define custom uniforms for the framebuffer's shader
    var self = this;
    var setHeightmapUniformsCallback = function() {
        self.fboHeightmap.shader.setFloat("u_frequency", frequency);
        self.fboHeightmap.shader.setFloat("u_amplitude", amplitude);
        self.fboHeightmap.shader.setInt("u_octaves", octaves);
        self.fboHeightmap.shader.setFloat("u_perturbation", perturbation);
        self.fboHeightmap.shader.setFloat("u_xOffset", xOffset);
        self.fboHeightmap.shader.setFloat("u_yOffset", yOffset);
    }

    // --- Create heightmap and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    this.heighmapOBJ.heightmapTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboHeightmap = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.heightmapTexture, "cellularNoise2", setHeightmapUniformsCallback);

    this.fboHeightmap.render();

    this.setOutputData(0, this.heighmapOBJ);
}

//register in the system
LiteGraph.registerNodeType("heightmap/cellularNoise2", CellularNoise2Node);
