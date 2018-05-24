function Renderer(canvas) {

	canvas.width = window.innerWidth
		|| document.documentElement.clientWidth
		|| document.body.clientWidth;

	canvas.height = window.innerHeight
		|| document.documentElement.clientHeight
		|| document.body.clientHeight;

	// this.heightmapTex = new Texture(256, 256, gl.R16F, gl.RED, gl.FLOAT, null);
	// this.framebufer = new FrameBuffer(256, 256, this.heightmapTex, "perlinNoise");

	this.axes = new OriginAxes();
	// Size more than 256 exceeds the max index value: 2^16
    this.terrain = new Terrain(4);

    gl.clearColor(0.176, 0.176, 0.160, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);

	gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

Renderer.prototype.render = function(camera) {

	gl.viewport(0, 0, Editor.glCanvas.width, Editor.glCanvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	this.axes.render(camera);
	this.terrain.render(camera);
}

Renderer.prototype.buildTerrain = function() {
	this.terrain.setupTerrain();
}
