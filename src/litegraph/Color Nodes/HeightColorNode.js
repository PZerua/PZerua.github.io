//node constructor class
function HeightColorNode() {

    this.addInput("Heightmap");
    this.addInput("Color 0.25","hcolor");
    this.addInput("Color 0.50","hcolor");
    this.addInput("Color 0.75","hcolor");
    this.addInput("Color 0.10","hcolor");
    this.addInput("Dispersion","number");
    this.addOutput("Heightmap");

    this.size[1] += 128.0;
}

//name to show
HeightColorNode.title = "Height Color";

//function to call when the node is executed
HeightColorNode.prototype.onExecute = function() {

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return
    } else {
        this.heighmapOBJ = Object.assign({}, heightmapOBJ);
    }

    var color0 = this.getInputData(1);
    if (color0 === undefined)
        color0 = [0.227, 0.525, 0.756];

    var color1 = this.getInputData(2);
    if (color1 === undefined)
        color1 = [0.925, 0.839, 0.603];

    var color2 = this.getInputData(3);
    if (color2 === undefined)
        color2 = [0.403, 0.615, 0.392];

    var color3 = this.getInputData(4);
    if (color3 === undefined)
        color3 = [0.909, 0.964, 0.956];

    var dispersion = this.getInputData(5);
    if (dispersion === undefined)
        dispersion = 2.0;

    dispersion /= 100.0;

    if (dispersion > 0.15)
        dispersion = 0.15;

    var self = this;
    var setFilterUniformsCallback = function() {
        self.fboColor.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboColor.shader.setFloat("u_size", self.heighmapOBJ.size);
        self.fboColor.shader.setFloat("u_heightScale", self.heighmapOBJ.heightScale);
        self.fboColor.shader.setFloat3("u_color0", color0);
        self.fboColor.shader.setFloat3("u_color1", color1);
        self.fboColor.shader.setFloat3("u_color2", color2);
        self.fboColor.shader.setFloat3("u_color3", color3);
        self.fboColor.shader.setFloat("u_dispersion", dispersion);
    }

    // --- Create normal map and save it in the provided texture ---
    // Create texture to be filled by the framebuffer
    this.heighmapOBJ.colorTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // Create framebuffer providing the texture and a custom shader
    this.fboColor = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.colorTexture, "heightColor", setFilterUniformsCallback);

    this.fboColor.render();

    // To display heightmap texture in node
    this.img = this.fboColor.toImage();

    this.setOutputData(0, this.heighmapOBJ);
}

HeightColorNode.prototype.onDrawBackground = function(ctx)
{
    var height = this.inputs.length * 15 + 5
    ctx.fillStyle = "rgb(30,30,30)";
    ctx.fillRect(0, height, this.size[0] + 1, this.size[1] - height);

    if(this.img) {
        ctx.drawImage(this.img, (this.size[0] - 128) / 2.0, height, 128, this.size[1] - height);
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/heightColor", HeightColorNode);
