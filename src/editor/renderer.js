function Renderer(canvas) {

	canvas.width = window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth;

	canvas.height = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;


	// Setup webgl
	gl.clearColor(0.176, 0.176, 0.160, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	this.shadersReady = false;

	this.initRenderer = function() {
		// Run first step
		Editor.graph.runStep()

		this.axes = new OriginAxes();
		// Size more than 256 exceeds the max index value: 2^16
		this.terrain = new Terrain(2);

		Editor.centerCamera();
		self.shadersReady = true;
	}

	// Precompile shaders
	var numCompiled = 0;
	var self = this;
	function precompileShadersCallback() {
		numCompiled++;

		if (numCompiled === Shader.precompileRegistry.length) {
			self.initRenderer();
		}
	}

	Shader.registerShader("terrain", "terrain");
	Shader.registerShader("axes", "axes");
	Shader.registerShader("common", "perlinNoise");
	Shader.registerShader("common", "valueNoise");
	Shader.registerShader("common", "cellularNoise");
	Shader.registerShader("common", "calcNormals");
	Shader.registerShader("common", "calcColor");
	Shader.registerShader("common", "powFilter");
	Shader.precompileShaders(precompileShadersCallback);

}

Renderer.prototype.render = function(camera) {

	if (!this.shadersReady) {
		return;
	}

	gl.viewport(0, 0, Editor.glCanvas.width, Editor.glCanvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	this.axes.render(camera);
	this.terrain.render(camera);
}

Renderer.prototype.buildTerrain = function() {
	this.terrain.setupTerrain();
}
