//node constructor class
function PerlinNoiseNode() {

    this.addInput("Amplitude", "number");
    this.addInput("Frequency", "number");
    this.addInput("Octaves", "number");
    this.addInput("Height Scale", "number");
    this.addInput("Perturbation", "number");
    this.addInput("X Offset", "number");
    this.addInput("Y Offset", "number");

    this.addOutput("Heightmap");

    this.heightmapOBJ = {
        heightmapTexture: undefined,
        normalsTexture: undefined,
        colorTexture: undefined,
        size: 0,
        heightScale: 0
    }

    this.properties = {amp:1.0,freq:3.0,oct:8,hscale:200,perturb:0.0,xoffset:0.0,yoffset:0.0};

    this.size[1] += 128.0;
}

//name to show
PerlinNoiseNode.title = "Perlin Noise";

PerlinNoiseNode.prototype.evaluateHash = function() {
    var inputsValues = [];
    var propArray = Object.values(this.properties);
    for (var i = 0; i < this.inputs.length; i++) {
        var input = propArray[i];

        if (input === undefined) {
            inputsValues[i] = 0;
        } else
        if (typeof input !== "number") {
            inputsValues[i] = input.heightmapTexture.hash + (input.colorTexture ? input.colorTexture.hash : "");
        } else {
            inputsValues[i] = input;
        }
    }

    // Detect terrain size changes
    inputsValues.push(Editor.terrainSize);

    var hash = Math.createHash(inputsValues);

    if (this.hash && this.hash == hash) {
        this.setOutputData(0, this.heightmapOBJ);
        return false;
    } else {
        this.hash = hash;
        return true;
    }
}

PerlinNoiseNode.prototype.checkProperties = function() {
    // Receive size
    this.heightmapOBJ.size = Editor.terrainSize;

    var idx = 0;

    // Receive amplitude
    this.properties.amp = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.amp;
    idx++;
    // Receive frequency
    this.properties.freq = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.freq;
    idx++;

    // Receive octaves
    this.properties.oct = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.oct;
    idx++;

    // Receive mesh height scale
    this.properties.hscale = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.hscale;
    this.heightmapOBJ.heightScale = this.properties.hscale
    idx++;

    // Receive perturbation
    this.properties.perturb = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.perturb;
    idx++;

    // Receive x offset
    this.properties.xoffset = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.xoffset;
    idx++;

    // Receive y offset
    this.properties.yoffset = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.yoffset;
    idx++;
}

//function to call when the node is executed
PerlinNoiseNode.prototype.onExecute = function() {

    this.checkProperties();
    var hashChanged = this.evaluateHash()

    if (hashChanged) {
        Editor.setCalculateColor("#a0711a");
    }

    if (!Editor.calculatingImages && !hashChanged) {
        this.setOutputData(0, this.lastOBJ);
        return;
    }

    // Define custom uniforms for the framebuffer's shader
    var self = this;
    var setHeightmapUniformsCallback = function() {
        self.fboHeightmap.shader.setFloat("u_frequency", self.properties.freq);
        self.fboHeightmap.shader.setFloat("u_amplitude", self.properties.amp);
        self.fboHeightmap.shader.setInt("u_octaves", self.properties.oct);
        self.fboHeightmap.shader.setFloat("u_perturbation", self.properties.perturb);
        self.fboHeightmap.shader.setFloat("u_xOffset", self.properties.xoffset);
        self.fboHeightmap.shader.setFloat("u_yOffset", self.properties.yoffset);
    }

    if (!this.heightmapOBJ.heightmapTexture) {
        // --- Create heightmap and save it in the provided texture ---
        // Create texture to be filled by the framebuffer
        this.heightmapOBJ.heightmapTexture = new Texture(this.heightmapOBJ.size, this.heightmapOBJ.size, gl.RGBA32F, gl.RGBA, gl.FLOAT, null, this.hash);
        // Create framebuffer providing the texture and a custom shader
        this.fboHeightmap = new FrameBuffer(this.heightmapOBJ.size, this.heightmapOBJ.size, this.heightmapOBJ.heightmapTexture, "perlinNoise", setHeightmapUniformsCallback);
    } else {
        this.heightmapOBJ.heightmapTexture.setHash(this.hash);
        this.fboHeightmap.setUniformsCallback(setHeightmapUniformsCallback);
    }

    this.fboHeightmap.render();

    if (Editor.calculatingImages) {
        // To display heightmap texture in node
        this.img = this.fboHeightmap.toImage();
    }

    this.lastOBJ = Object.assign({}, this.heightmapOBJ);
    this.setOutputData(0, this.heightmapOBJ);
}

PerlinNoiseNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img && !Editor.fastEditMode) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/perlinNoise", PerlinNoiseNode);
