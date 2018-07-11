//node constructor class
function OutputNode() {

    this.addInput("Heightmap");
}

//name to show
OutputNode.title = "Output";
OutputNode.position = [10, 50];
OutputNode.size = [300, 50];

OutputNode.prototype.evaluateHash = function() {
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
        return false;
    } else {
        this.hash = hash;
        return true;
    }
}

//function to call when the node is executed
OutputNode.prototype.onExecute = function() {

    var hashChanged = this.evaluateHash()

    if (!Editor.calculatingImages && (!hashChanged || Editor.fastEditMode)) {
        return;
    }

    // Receive heightmap Obj and copy its contents (I don't want to modify it being a reference, bad things can happen)
    var heightmapOBJ = this.getInputData(0);
    if (heightmapOBJ === undefined) {
        return
    } else {
        this.heighmapOBJ = Object.assign({}, this.getInputData(0));
    }
    var self = this;

    var setNormalsUniformsCallback = function() {
        self.fboNormals.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboNormals.shader.setFloat("u_size", self.heighmapOBJ.size);
        self.fboNormals.shader.setFloat("u_heightScale", self.heighmapOBJ.heightScale);
    }

    var setColorUniformsCallback = function() {
        self.fboColor.shader.setInt("u_heightmapTexture", 0);
        gl.activeTexture(gl.TEXTURE0);
        self.heighmapOBJ.heightmapTexture.bind();

        self.fboColor.shader.setFloat("u_size", self.heighmapOBJ.size);
        self.fboColor.shader.setFloat("u_heightScale", self.heighmapOBJ.heightScale);
    }

    if (!this.normalsTexture) {
        // --- Create normal map and save it in the provided texture ---
        // Create texture to be filled by the framebuffer
        this.normalsTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA32F, gl.RGBA, gl.FLOAT, null, this.hash);
        // Create framebuffer providing the texture and a custom shader
        this.fboNormals = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.normalsTexture, "calcNormals", setNormalsUniformsCallback);
    } else {
        this.fboNormals.setUniformsCallback(setNormalsUniformsCallback)
    }

    this.fboNormals.render();
    this.heighmapOBJ.normalsTexture = this.normalsTexture

    if (!this.colorTexture) {

        // Create texture to be filled by the framebuffer
        this.colorTexture = new Texture(this.heighmapOBJ.size, this.heighmapOBJ.size, gl.RGBA32F, gl.RGBA, gl.FLOAT, null, this.hash);
        this.fboColor = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.colorTexture);

    } else {
        this.colorTexture.setHash(this.hash);
    }

    if (!this.heighmapOBJ.colorTexture) {
        // Create framebuffer providing the texture and a custom shader
        this.fboColor.setTexture(this.colorTexture);
        this.fboColor.setShader("calcColor");
        this.fboColor.setUniformsCallback(setColorUniformsCallback);

        this.fboColor.render();

        this.heighmapOBJ.colorTexture = this.colorTexture

    } else {
        this.fboColor.setTexture(this.heighmapOBJ.colorTexture);
    }

    if (!this.fboHeightmap) {
        // Create framebuffer providing the texture and a custom shader
        this.fboHeightmap = new FrameBuffer(this.heighmapOBJ.size, this.heighmapOBJ.size, this.heighmapOBJ.heightmapTexture);
    } else {
        this.fboHeightmap.setTexture(this.heighmapOBJ.heightmapTexture);
    }

    if (Editor.calculatingImages) {
        // Display heightmap texture in editor
        var img = this.fboHeightmap.toImage();
        var htmlImg = document.getElementById("heightmapTex");
        htmlImg.src = img.src;

        // Display normal texture in editor
        img = this.fboNormals.toImage();
        htmlImg = document.getElementById("normalsTex");
        htmlImg.src = img.src;

        // Display color texture in editor
        img = this.fboColor.toImage();
        htmlImg = document.getElementById("colorTex");
        htmlImg.src = img.src;

        Editor.calculatingImages = false;
        Editor.setCalculateColor("#3F3F3F");
    }
}

//register in the system
LiteGraph.registerNodeType("heightmap/heightmapOutput", OutputNode);
