//node constructor class
function RemapFilterNode() {

    this.addInput("Heightmap");
    this.addInput("From");
    this.addInput("To");
    this.addOutput("Heightmap");

}

//name to show
RemapFilterNode.title = "Remap Filter";
RemapFilterNode.position = [10, 50];
RemapFilterNode.size = [300, 50];

//function to call when the node is executed
RemapFilterNode.prototype.onExecute = function() {

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return
    } else {
        this.heighmapOBJ = Object.assign({}, heightmapOBJ);
    }

    var minimum = this.getInputData(1);
    if (minimum === undefined)
        minimum = 0.0;

    to = this.getInputData(2);
    if (to === undefined)
        to = 1.0;

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboFilter.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboFilter.shader.setFloat("u_from", from);
        self.fboFilter.shader.setFloat("u_to", to);
    }

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    var filterTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboFilter = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, filterTexture, "remapFilter", setFilterUniformsCallback);

    this.fboFilter.render();

    this.heighmapOBJ.heightmapTexture = filterTexture;

    this.setOutputData(0, this.heighmapOBJ);
}

//register in the system
LiteGraph.registerNodeType("heightmap/remapFilter", RemapFilterNode);
