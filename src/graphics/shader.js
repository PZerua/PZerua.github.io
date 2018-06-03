function Shader(shaderName, shaderCallback) {

    this.programId;
    this.isLoaded = false;
    this.shaderName = shaderName;

    var numCompleted = 0;
    var result = [];

    // Callback that calls compileShaders when both files are loaded
    function loadedCallback(text, index) {
        result[index] = text;
        numCompleted++;

        // When both sources are loaded, compile them
        if (numCompleted == 2)
            compileShaders(result);
    }

    loadFile("data/shaders/" + shaderName + ".vs", loadedCallback, 0);
    loadFile("data/shaders/" + shaderName + ".fs", loadedCallback, 1);

    var self = this;

    function compileShaders(shaderTexts)
    {
        var vertex = gl.createShader(gl.VERTEX_SHADER);
        var fragment = gl.createShader(gl.FRAGMENT_SHADER);

        // Compile vertex source
        gl.shaderSource(vertex, shaderTexts[0]);
        gl.compileShader(vertex);

        // Compile fragment source
        gl.shaderSource(fragment, shaderTexts[1]);
        gl.compileShader(fragment);

        // Print compile errors for vertex compilation
        if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS))
        {
            var log = gl.getShaderInfoLog(vertex);
            console.error("Error compiling vertex shader from \"" + self.shaderName + "\"\n" + log);
        }
        // Print compile errors for fragment compilation
        if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS))
        {
            var log = gl.getShaderInfoLog(fragment);
            console.error("Error compiling fragment shader from \"" + self.shaderName + "\"\n" + log);
        }

        // Shader Program
        self.programId = gl.createProgram();
        gl.attachShader(self.programId, vertex);
        gl.attachShader(self.programId, fragment);
        gl.linkProgram(self.programId);

        // Print errors if any
        if (!gl.getProgramParameter(self.programId, gl.LINK_STATUS))
        {
            var log = gl.getProgramInfoLog(self.programId);
            console.error("Error in program compilation\n" + log);
            return;
        }
        else self.isLoaded = true;

        // Delete unnecessary shaders (we have program)
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);

        console.log("Shader \"" + self.shaderName + "\" compiled")

        // Save shader instance
        Shader.shadersMap[self.shaderName] = self;

        if (shaderCallback !== undefined) {
            shaderCallback();
        }
    }

    this.enable = function() {
        gl.useProgram(this.programId);
    }

    this.disable = function() {
        gl.useProgram(null);
    }

    this.setMatrix4 = function(name, matrix) {
        gl.uniformMatrix4fv(gl.getUniformLocation(this.programId, name), false, matrix.m);
    }

    this.setVec3 = function(name, vector) {
        gl.uniform3f(gl.getUniformLocation(this.programId, name), vector.x, vector.y, vector.z);
    }

    this.setInt = function(name, value) {
        gl.uniform1i(gl.getUniformLocation(this.programId, name), value);
    }

    this.setFloat = function(name, value) {
        gl.uniform1f(gl.getUniformLocation(this.programId, name), value);
    }

    this.setFloatVector = function(name, values, count) {
        gl.uniform1fv(gl.getUniformLocation(this.programId, name), count, values);
    }
}

// Prevents compiling a single shader multiple times. The function returns shader instances
Shader.getShader = function(shaderName) {
    if (Shader.shadersMap[shaderName] !== undefined) {
        return Shader.shadersMap[shaderName];
    }
    else {
        console.error("The shader " +  shaderName + " was not precompiled");
    }
}

// Prevents compiling a single shader multiple times. The function returns shader instances
Shader.registerShader = function(shaderName) {
    Shader.precompileRegistry.push(shaderName);
}

Shader.precompileShaders = function(shaderCallback) {
    for (var i = 0; i < Shader.precompileRegistry.length; i++) {
        var shaderName = Shader.precompileRegistry[i];
        Shader.shadersMap[shaderName] = new Shader(shaderName, shaderCallback);
    }
}

// Map containing map instances
Shader.shadersMap = {};
// Map containing map instances
Shader.precompileRegistry = [];
