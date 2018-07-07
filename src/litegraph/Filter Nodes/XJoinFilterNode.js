//node constructor class
function XJoinFilterNode() {

    this.addInput("Heightmap0");
    this.addInput("Heightmap1");
    this.addInput("Offset");
    this.addInput("Threshold");
    this.addOutput("Heightmap");

    this.size[1] += 128.0;
}

//name to show
XJoinFilterNode.title = "X Join Filter";

//function to call when the node is executed
XJoinFilterNode.prototype.onExecute = function() {

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
        return;
    } else {
        this.hash = hash;
    }

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ_0 = this.getInputData(0);
    if (heightmapOBJ_0 === undefined) {
        return
    } else {
        this.heightmapOBJ_0 = Object.assign({}, heightmapOBJ_0);
    }

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ_1 = this.getInputData(1);
    if (heightmapOBJ_1 === undefined) {
        return
    } else {
        this.heightmapOBJ_1 = Object.assign({}, heightmapOBJ_1);
    }

    if (this.heightmapOBJ_0.size !== this.heightmapOBJ_1.size) {
        console.error("Size missmatch between heightmaps");
        return;
    }

    var offset = this.getInputData(2);
    if (offset === undefined)
        offset = 0.5

    var threshold = this.getInputData(3);
    if (threshold === undefined)
        threshold = 0.2;

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture0", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heightmapOBJ_0.heightmapTexture.bind();

        self.fboFilter.shader.setInt("u_heightmapTexture1", 1);
        gl.activeTexture(gl.TEXTURE1);
        self.heightmapOBJ_1.heightmapTexture.bind();

        self.fboFilter.shader.setFloat("u_offset", offset);
        self.fboFilter.shader.setFloat("u_threshold", threshold);
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

        self.fboFilter.shader.setFloat("u_threshold", threshold);
    }

    // Create texture to be filled by the framebuffer
    var filterTexture = new Texture(this.heightmapOBJ_0.size, this.heightmapOBJ_0.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null, this.hash);
    // Create framebuffer providing the texture and a custom shader
    this.fboFilter = new FrameBuffer(this.heightmapOBJ_0.size, this.heightmapOBJ_0.size, filterTexture, "xJoinFilter", setFilterUniformsCallback);

    this.fboFilter.render();

    // Create texture to be filled by the framebuffer
    var filterTextureColor = new Texture(this.heightmapOBJ_0.size, this.heightmapOBJ_0.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null, this.hash);
    // Create framebuffer providing the texture and a custom shader
    this.fboFilterColor = new FrameBuffer(this.heightmapOBJ_0.size, this.heightmapOBJ_0.size, filterTextureColor, "xJoinFilter", setFilterColorUniformsCallback);

    this.fboFilterColor.render();

    this.heightmapOBJ_0.heightmapTexture = filterTexture;
    this.heightmapOBJ_0.colorTexture = filterTextureColor;

    // Only generate preview when fast edit is disabled
    if (!Editor.fastEditMode) {
        // To display heightmap texture in node
        this.img = this.fboFilter.toImage();
    }

    this.setOutputData(0, this.heightmapOBJ_0);
}

XJoinFilterNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img && !Editor.fastEditMode) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/xJoinFilter", XJoinFilterNode);
