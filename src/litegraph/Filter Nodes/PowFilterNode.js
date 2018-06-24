//node constructor class
function PowFilterNode() {

    this.addInput("Heightmap");
    this.addInput("Exponent");

    this.addOutput("Heightmap");

    this.size[1] += 128.0;
}

//name to show
PowFilterNode.title = "Pow Filter";

//function to call when the node is executed
PowFilterNode.prototype.onExecute = function() {

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return
    } else {
        this.heighmapOBJ = Object.assign({}, heightmapOBJ);
    }

    var exponent = this.getInputData(1);
    if (exponent === undefined)
        exponent = 1.0;

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboFilter.shader.setFloat("u_exponent", exponent);
    }

    // Create texture to be filled by the framebuffer
    var filterTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboFilter = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, filterTexture, "powFilter", setFilterUniformsCallback);

    this.fboFilter.render();

    this.heighmapOBJ.heightmapTexture = filterTexture;

    // To display heightmap texture in node
    this.img = this.fboFilter.toImage();

    this.setOutputData(0, this.heighmapOBJ);
}

PowFilterNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/powFilter", PowFilterNode);
