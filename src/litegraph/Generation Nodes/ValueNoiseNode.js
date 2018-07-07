//node constructor class
function ValueNoiseNode() {

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

    this.size[1] += 128.0;
}

//name to show
ValueNoiseNode.title = "Value Noise";

//function to call when the node is executed
ValueNoiseNode.prototype.onExecute = function() {

    var inputsValues = [];
    for (var i = 0; i < this.inputs.length; i++) {
        var input = this.getInputData(i);

        if (input === undefined) {
            inputsValues[i] = 0;
        } else
        if (typeof input !== "number") {
            inputsValues[i] = input.heightmapTexture.hash + (input.colorTexture ? input.colorTexture.hash : "");
        } else {
            inputsValues[i] = input;
        }
    }

    // Force to reevaluate when changing between modes
    inputsValues.push(Editor.fastEditMode ? 1 : 0);

    var hash = Math.createHash(inputsValues);

    if (this.hash && this.hash == hash) {
        this.setOutputData(0, this.heighmapOBJ);
        return;
    } else {
        this.hash = hash;
    }

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
    this.heighmapOBJ.heightmapTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null, this.hash);
    // Create framebuffer providing the texture and a custom shader
    this.fboHeightmap = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.heightmapTexture, "valueNoise", setHeightmapUniformsCallback);

    this.fboHeightmap.render();

    // Only generate preview when fast edit is disabled
    if (!Editor.fastEditMode) {
        // To display heightmap texture in node
        this.img = this.fboHeightmap.toImage();
    }

    this.setOutputData(0, this.heighmapOBJ);
}

ValueNoiseNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img && !Editor.fastEditMode) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/valueNoise", ValueNoiseNode);
