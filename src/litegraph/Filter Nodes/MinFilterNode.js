//node constructor class
function MinFilterNode() {

    this.addInput("Heightmap0");
    this.addInput("Heightmap1");
    this.addOutput("Heightmap");

    this.size[1] += 128.0;
}

//name to show
MinFilterNode.title = "Min Filter";

MinFilterNode.prototype.evaluateHash = function() {
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

    var hash = Math.createHash(inputsValues);

    if (this.hash && this.hash == hash) {
        this.setOutputData(0, this.heighmapOBJ);
        return false;
    } else {
        this.hash = hash;
        return true;
    }
}

MinFilterNode.prototype.onConnectionsChange = function() {
    if (this.heightmapOBJ) {
        this.setOutputData(0, this.heightmapOBJ);
    }
}

MinFilterNode.prototype.checkProperties = function() {
    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ_0 = this.getInputData(0);
    if (heightmapOBJ_0 === undefined) {
        return false;
    } else {
        this.heightmapOBJ_0 = Object.assign({}, heightmapOBJ_0);
    }

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ_1 = this.getInputData(1);
    if (heightmapOBJ_1 === undefined) {
        return false;
    } else {
        this.heightmapOBJ_1 = Object.assign({}, heightmapOBJ_1);
    }

    // Receive size
    this.heightmapOBJ_0.size = Editor.terrainSize;
    this.heightmapOBJ_1.size = Editor.terrainSize;

    return true;
}

//function to call when the node is executed
MinFilterNode.prototype.onExecute = function() {

    if(!this.checkProperties()) {
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

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture0", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heightmapOBJ_0.heightmapTexture.bind();

        self.fboFilter.shader.setInt("u_heightmapTexture1", 1);
        gl.activeTexture(gl.TEXTURE1);
        self.heightmapOBJ_1.heightmapTexture.bind();
    }

    var setFilterColorUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture0", 0);
        gl.activeTexture(gl.TEXTURE0);
        if (self.heightmapOBJ_0.colorTexture === undefined) {
            self.heightmapOBJ_0.heightmapTexture.bind();
        } else {
            self.heightmapOBJ_0.colorTexture.bind();
        }

        self.fboFilter.shader.setInt("u_heightmapTexture1", 1);
        gl.activeTexture(gl.TEXTURE1);
        if (self.heightmapOBJ_1.colorTexture === undefined) {
            self.heightmapOBJ_1.heightmapTexture.bind();
        } else {
            self.heightmapOBJ_1.colorTexture.bind();
        }
    }

    if (!this.filterTexture) {
        // Create texture to be filled by the framebuffer
        this.filterTexture = new Texture(this.heightmapOBJ_0.size, this.heightmapOBJ_0.size, gl.RGBA32F, gl.RGBA, gl.FLOAT, null, this.hash);
        // Create framebuffer providing the texture and a custom shader
        this.fboFilter = new FrameBuffer(this.heightmapOBJ_0.size, this.heightmapOBJ_0.size, this.filterTexture, "minFilter", setFilterUniformsCallback);
    } else {
        this.filterTexture.setHash(this.hash);
    }

    if (!this.filterTextureColor) {
        // Create texture to be filled by the framebuffer
        this.filterTextureColor = new Texture(this.heightmapOBJ_0.size, this.heightmapOBJ_0.size, gl.RGBA32F, gl.RGBA, gl.FLOAT, null, this.hash);
        // Create framebuffer providing the texture and a custom shader
        this.fboFilterColor = new FrameBuffer(this.heightmapOBJ_0.size, this.heightmapOBJ_0.size, this.filterTextureColor, "minFilter", setFilterColorUniformsCallback);
    } else {
        this.filterTextureColor.setHash(this.hash);
    }

    this.fboFilter.setUniformsCallback(setFilterUniformsCallback)
    this.fboFilterColor.setUniformsCallback(setFilterColorUniformsCallback)
    this.fboFilter.render();
    this.fboFilterColor.render();

    this.heightmapOBJ_0.heightmapTexture = this.filterTexture;
    this.heightmapOBJ_0.colorTexture = this.filterTextureColor;

    if (Editor.calculatingImages) {
        // To display heightmap texture in node
        this.img = this.fboFilter.toImage();
    }

    this.lastOBJ = Object.assign({}, this.heightmapOBJ_0);
    this.setOutputData(0, this.heightmapOBJ_0);
}

MinFilterNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img && !Editor.fastEditMode) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/minFilter", MinFilterNode);
