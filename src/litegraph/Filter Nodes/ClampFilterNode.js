//node constructor class
function ClampFilterNode() {

    this.addInput("Heightmap");
    this.addInput("Minimum");
    this.addInput("Maximum");
    this.addOutput("Heightmap");

}

//name to show
ClampFilterNode.title = "Clamp Filter";
ClampFilterNode.position = [10, 50];
ClampFilterNode.size = [300, 50];

//function to call when the node is executed
ClampFilterNode.prototype.onExecute = function() {

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return
    } else {
        this.heighmapOBJ = Object.assign({}, heightmapOBJ);
    }

    this.minimum = this.getInputData(1);
    if (this.minimum === undefined)
        this.minimum = 0.0;

    this.maximum = this.getInputData(2);
    if (this.maximum === undefined)
        this.maximum = 1.0;

    var self = this;

    var setFilterUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboFilter.shader.setFloat("u_minimum", self.minimum);
        self.fboFilter.shader.setFloat("u_maximum", self.maximum);
    }

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    var filterTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboFilter = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, filterTexture, "clampFilter", setFilterUniformsCallback);

    this.fboFilter.render();

    this.heighmapOBJ.heightmapTexture = filterTexture;

    this.setOutputData(0, this.heighmapOBJ);
}

//register in the system
LiteGraph.registerNodeType("heightmap/clampFilter", ClampFilterNode);
