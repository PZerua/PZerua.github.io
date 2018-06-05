function Shader(vertexName, fragmentName, shaderCallback) {

    this.programId;
    this.isLoaded = false;
    this.vertexName = vertexName;
    this.fragmentName = fragmentName;

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

    loadFile("data/shaders/" + vertexName + ".vs", loadedCallback, 0);
    loadFile("data/shaders/" + fragmentName + ".fs", loadedCallback, 1);

    var self = this;

    function compileShaders(shaderTexts)
    {
        // Compile vertex source
        var vertex = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertex, shaderTexts[0]);
        gl.compileShader(vertex);
        // Print compile errors for vertex compilation
        if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS))
        {
            var log = gl.getShaderInfoLog(vertex);
            console.error("Error compiling vertex shader from \"" + self.vertexName + "\"\n" + log);
        }

        // Compile fragment source
        var fragment = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragment, shaderTexts[1]);
        gl.compileShader(fragment);
        // Print compile errors for fragment compilation
        if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS))
        {
            var log = gl.getShaderInfoLog(fragment);
            console.error("Error compiling fragment shader from \"" + self.fragmentName + "\"\n" + log);
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
        gl.deleteShader(fragment);

        console.log("Shader \"" + self.fragmentName + "\" compiled")

        // Save shader instance
        Shader.shadersMap[self.fragmentName] = self;

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
Shader.registerShader = function(vertexName, fragmentName) {
    Shader.precompileRegistry.push({vertexName, fragmentName});
}

// Compiles all shaders in the precompile registry
Shader.precompileShaders = function(shaderCallback) {
    for (var i = 0; i < Shader.precompileRegistry.length; i++) {
        var vertexName = Shader.precompileRegistry[i].vertexName;
        var fragmentName = Shader.precompileRegistry[i].fragmentName;
        Shader.shadersMap[fragmentName] = new Shader(vertexName, fragmentName, shaderCallback);
    }
}

// Map containing map instances
Shader.shadersMap = {};
// Array containing shader names to compile
Shader.precompileRegistry = [];
// Map containing already compiled vertex shaders to avoid recompilation
Shader.vertexShaders = {};
