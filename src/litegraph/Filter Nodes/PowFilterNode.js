//node constructor class
function PowFilterNode() {

    this.addInput("Heightmap");
    this.addInput("Exponent");

    this.addOutput("Heightmap");

    this.properties = {exponent:1.0};

    this.size[1] += 128.0;
}

//name to show
PowFilterNode.title = "Pow Filter";

PowFilterNode.prototype.evaluateHash = function() {
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

    // Detect terrain size changes
    inputsValues.push(Editor.terrainSize);

    var hash = Math.createHash(inputsValues);

    if (this.hash && this.hash == hash) {
        this.setOutputData(0, this.heighmapOBJ);
        return false;
    } else {
        this.hash = hash;
        return true;
    }
}

PowFilterNode.prototype.onConnectionsChange = function() {
    if (this.heightmapOBJ) {
        this.setOutputData(0, this.heightmapOBJ);
    }
}

PowFilterNode.prototype.checkProperties = function() {
    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return false;
    } else {
        this.heightmapOBJ = Object.assign({}, heightmapOBJ);
    }

    // Receive size
    this.heightmapOBJ.size = Editor.terrainSize;

    var idx = 1;

    this.properties.exponent = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.exponent;
    idx++;

    return true;
}

//function to call when the node is executed
PowFilterNode.prototype.onExecute = function() {

    if(!this.checkProperties()) {
        this.setOutputData(0, this.lastOBJ);
        return;
    }
    var hashChanged = this.evaluateHash()

    if (hashChanged) {
        Editor.setCalculateColor("#a0711a");
    }

    if (!Editor.calculatingImages && !hashChanged) {
        //this.setOutputData(0, this.heightmapOBJ);
        this.setOutputData(0, this.lastOBJ);
        return;
    }

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heightmapOBJ.heightmapTexture.bind();

        self.fboFilter.shader.setFloat("u_exponent", self.properties.exponent);
    }

    if (!this.filterTexture) {
        // Create texture to be filled by the framebuffer
        this.filterTexture = new Texture(this.heightmapOBJ.size, this.heightmapOBJ.size, gl.RGBA32F, gl.RGBA, gl.FLOAT, null, this.hash);
        // Create framebuffer providing the texture and a custom shader
        this.fboFilter = new FrameBuffer(this.heightmapOBJ.size, this.heightmapOBJ.size, this.filterTexture, "powFilter", setFilterUniformsCallback);
    } else {
        this.filterTexture.setHash(this.hash);
    }

    this.fboFilter.setUniformsCallback(setFilterUniformsCallback)
    this.fboFilter.render();

    //this.heighmapOBJ.heightmapTexture.delete();
    this.heightmapOBJ.heightmapTexture = this.filterTexture;

    // Only generate preview when fast edit is disabled
    if (Editor.calculatingImages) {
        // To display heightmap texture in node
        this.img = this.fboFilter.toImage();
    }

    this.lastOBJ = Object.assign({}, this.heightmapOBJ);
    this.setOutputData(0, this.heightmapOBJ);
}

PowFilterNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img && !Editor.fastEditMode) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/powFilter", PowFilterNode);
