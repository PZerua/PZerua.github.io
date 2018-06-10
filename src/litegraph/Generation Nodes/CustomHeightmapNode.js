//node constructor class
function CustomHeightmapNode() {

    this.addInput("Image", "image");
    this.addInput("Size", "number");
    this.addInput("Height Scale", "number");
    this.addOutput("Heightmap");

    // The object to be exported
    this.heighmapOBJ = {
        heightmapTexture: undefined,
        normalsTexture: undefined,
        colorTexture: undefined,
        size: 0,
        heightScale: 0
    }
}

//name to show
CustomHeightmapNode.title = "Custom Heightmap";
CustomHeightmapNode.position = [10, 50];
CustomHeightmapNode.size = [300, 50];

//function to call when the node is executed
CustomHeightmapNode.prototype.onExecute = function() {

    var image = this.getInputData(0);
    if (image === undefined) {
        return;
    }

    // Receive size
    this.heighmapOBJ.size = this.getInputData(1);
    if (this.heighmapOBJ.size === undefined) {
        this.heighmapOBJ.size = image.width;
    } else {
        image.width = this.heighmapOBJ.size;
        image.height = this.heighmapOBJ.size;
        // Resize
    }

    // Receive mesh height scale
    this.heighmapOBJ.heightScale = this.getInputData(2);
    if (this.heighmapOBJ.heightScale === undefined)
        this.heighmapOBJ.heightScale = 200;

    // Define custom uniforms for the framebuffer's shader
    var self = this;
    var setHeightmapUniformsCallback = function() {
        self.fboHeightmap.shader.setFloat("u_frequency", self.frequency);
        self.fboHeightmap.shader.setFloat("u_amplitude", self.amplitude);
        self.fboHeightmap.shader.setInt("u_octaves", self.octaves);
    }

    // --- Create heightmap and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    this.heighmapOBJ.heightmapTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    this.setOutputData(0, this.heighmapOBJ);
}

//register in the system
LiteGraph.registerNodeType("heightmap/customHeightmap", CustomHeightmapNode);
