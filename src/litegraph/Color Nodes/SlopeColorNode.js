//node constructor class
function SlopeColorNode() {

    this.addInput("Heightmap");
    this.addInput("Color 0.25","hcolor");
    this.addInput("Color 0.50","hcolor");
    this.addInput("Color 0.75","hcolor");
    this.addInput("Color 1.00","hcolor");
    this.addInput("Dispersion","number");
    this.addOutput("Heightmap");

    this.properties = {color0:[1.0,1.0,1.0],color1:[1.0,1.0,1.0],color2:[1.0,1.0,1.0],color3:[1.0,1.0,1.0],dispersion:2.0};

    this.size[1] += 128.0;
}

//name to show
SlopeColorNode.title = "Slope Color";

SlopeColorNode.prototype.evaluateHash = function() {
    var inputsValues = [];
    for (var i = 0; i < this.inputs.length; i++) {
        var input = this.getInputData(i);

        if (input === undefined) {
            inputsValues.push(0);
        } else
        if (input.constructor === Object) {
            inputsValues.push((input.heightmapTexture ? input.heightmapTexture.hash : "") + (input.colorTexture ? input.colorTexture.hash : ""));
        } else
        if (input.constructor === Array) {
            for (var j = 0; j < input.length; j++) {
                inputsValues.push(input[j]);
            }
        } else {
            inputsValues.push(input);
        }
    }

    var hash = Math.createHash(inputsValues);

    if (this.hash && this.hash == hash) {
        return false;
    } else {
        this.hash = hash;
        return true;
    }
}

SlopeColorNode.prototype.onConnectionsChange = function() {
    if (this.lastOBJ) {
        this.setOutputData(0, this.lastOBJ);
    }
}

SlopeColorNode.prototype.checkProperties = function() {
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

    this.properties.color0 = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.color0;
    idx++;
    this.properties.color1 = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.color1;
    idx++;
    this.properties.color2 = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.color2;
    idx++;
    this.properties.color3 = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.color3;
    idx++;
    this.properties.dispersion = this.getInputData(idx) !== undefined ? this.getInputData(idx) : this.properties.dispersion;
    idx++;

    return true;
}

//function to call when the node is executed
SlopeColorNode.prototype.onExecute = function() {

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

    this.properties.dispersion /= 100.0;

    if (this.properties.dispersion > 0.15)
        this.properties.dispersion = 0.15;

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboColor.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heightmapOBJ.heightmapTexture.bind();

        self.fboColor.shader.setFloat("u_size", self.heightmapOBJ.size);
        self.fboColor.shader.setFloat("u_heightScale", self.heightmapOBJ.heightScale);
        self.fboColor.shader.setFloat3("u_color0", self.properties.color0);
        self.fboColor.shader.setFloat3("u_color1", self.properties.color1);
        self.fboColor.shader.setFloat3("u_color2", self.properties.color2);
        self.fboColor.shader.setFloat3("u_color3", self.properties.color3);
        self.fboColor.shader.setFloat("u_dispersion", self.properties.dispersion);
    }

    if (!this.colorTexture) {
        // Create texture to be filled by the framebuffer
        this.colorTexture = new Texture(this.heightmapOBJ.size, this.heightmapOBJ.size, gl.RGBA32F, gl.RGBA, gl.FLOAT, null, this.hash);
        // Create framebuffer providing the texture and a custom shader
        this.fboColor = new FrameBuffer(this.heightmapOBJ.size, this.heightmapOBJ.size, this.colorTexture, "slopeColor", setFilterUniformsCallback);
    } else {
        this.colorTexture.setHash(this.hash);
    }

    this.fboColor.setUniformsCallback(setFilterUniformsCallback)
    this.fboColor.render();

    this.heightmapOBJ.colorTexture = this.colorTexture;

    // Only generate preview when fast edit is disabled
    if (Editor.calculatingImages) {
        // To display heightmap texture in node
        this.img = this.fboColor.toImage();
    }

    this.lastOBJ = Object.assign({}, this.heightmapOBJ);
    this.setOutputData(0, this.heightmapOBJ);
}

SlopeColorNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img && !Editor.fastEditMode) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/slopeColor", SlopeColorNode);
