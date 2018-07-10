//node constructor class
function CustomHeightmapNode() {

    this.addInput("Image", "image");
    this.addInput("Height Scale", "number");
    this.addOutput("Heightmap");

    // The object to be exported
    this.heightmapOBJ = {
        heightmapTexture: undefined,
        normalsTexture: undefined,
        colorTexture: undefined,
        size: 0,
        heightScale: 0
    }

    this.properties = {hscale:200};

    this.size[1] += 128.0;
}

//name to show
CustomHeightmapNode.title = "Custom Heightmap";

CustomHeightmapNode.prototype.evaluateHash = function() {
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
    inputsValues.push(this.inputImage ? this.inputImage.src : "");

    var hash = Math.createHash(inputsValues);

    if (this.hash && this.hash == hash) {
        this.setOutputData(0, this.heightmapOBJ);
        return false;
    } else {
        this.hash = hash;
        return true;
    }
}

CustomHeightmapNode.prototype.checkProperties = function() {
    // Receive size
    this.heightmapOBJ.size = Editor.terrainSize;
    if (this.heightmapOBJ.size === undefined)
        this.heightmapOBJ.size = 1024;
    else {
        // TODO: Resize image
    }

    var idx = 0;

    this.inputImage = this.getInputData(idx);
    if (this.inputImage === undefined) {
        return false;
    }
    idx++

    // Receive mesh height scale
    this.properties.hscale = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.hscale;
    this.heightmapOBJ.heightScale = this.properties.hscale
    idx++;

    return true;
}

//function to call when the node is executed
CustomHeightmapNode.prototype.onExecute = function() {
    if (!this.checkProperties()) {
        this.setOutputData(0, this.lastOBJ);
        return;
    }

    var hashChanged = this.evaluateHash()

    if (hashChanged) {
        Editor.setCalculateColor("#a0711a");
    }

    if (!Editor.calculatingImages && !hashChanged) {
        this.setOutputData(0, this.lastOBJ);
        return;
    }

    if (!this.heightmapOBJ.heightmapTexture) {
        // --- Create heightmap and save it in the provided texture ---
        // Create texture to be filled by the framebuffer
        this.heightmapOBJ.heightmapTexture = new Texture(this.heightmapOBJ.size, this.heightmapOBJ.size, gl.RGBA32F, gl.RGBA, gl.FLOAT, this.inputImage, this.hash);
        // Create framebuffer providing the texture and a custom shader
        this.fboHeightmap = new FrameBuffer(this.heightmapOBJ.size, this.heightmapOBJ.size, this.heightmapOBJ.heightmapTexture);
    } else {
        this.heightmapOBJ.heightmapTexture.setHash(this.hash);
    }

    // Only generate preview when fast edit is disabled
    if (Editor.calculatingImages) {
        // To display heightmap texture in node
        this.img = this.fboHeightmap.toImage();
    }

    this.lastOBJ = Object.assign({}, this.heightmapOBJ);
    this.setOutputData(0, this.heighmapOBJ);
}

CustomHeightmapNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img && !Editor.fastEditMode) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/customHeightmap", CustomHeightmapNode);
