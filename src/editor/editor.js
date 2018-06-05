var Editor = {
	glCanvas : document.getElementById("glCanvas"),
    camera : new Camera(),
	renderer : undefined,
	prevMousePos: new vec2(0, 0),
	mousePos : new vec2(0, 0),
	mouseDelta: new vec2(0, 0),
	isLeftClicking : false,
	currentKeys: {},
	stats: new Stats(),
	graph : new LGraph(),
	sizeNode : undefined,
	amplitudeNode : undefined,
	octavesNode : undefined,
	heightScaleNode : undefined,
	frequencyNode : undefined,
	perlinNode: undefined,
	outputNode : undefined,
	init : function() {

		var container = document.getElementById("container")
		this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		this.stats.dom.style.position = "absolute";
		container.appendChild( this.stats.dom );

		this.graphCanvas = new LGraphCanvas("#graphCanvas", this.graph);
		this.graphCanvas.resize();

		window.addEventListener("resize", function() { Editor.graphCanvas.resize(); } );

		// Setup litegraph default nodes
		this.sizeNode = LiteGraph.createNode("basic/const");
		this.sizeNode.title = "Size";
		this.sizeNode.pos = [200,500];
		this.graph.add(this.sizeNode);
		this.sizeNode.setValue(1024.0);

		this.amplitudeNode = LiteGraph.createNode("basic/const");
		this.amplitudeNode.title = "Amplitude";
		this.amplitudeNode.pos = [200,550];
		this.graph.add(this.amplitudeNode);
		this.amplitudeNode.setValue(1.0);

		this.frequencyNode = LiteGraph.createNode("basic/const");
		this.frequencyNode.title = "Frequency";
		this.frequencyNode.pos = [200,600];
		this.graph.add(this.frequencyNode);
		this.frequencyNode.setValue(3);

		this.octavesNode = LiteGraph.createNode("basic/const");
		this.octavesNode.title = "Octaves";
		this.octavesNode.pos = [200,650];
		this.graph.add(this.octavesNode);
		this.octavesNode.setValue(8.0);

		this.heightScaleNode = LiteGraph.createNode("basic/const");
		this.heightScaleNode.title = "Height Scale";
		this.heightScaleNode.pos = [200,700];
		this.graph.add(this.heightScaleNode);
		this.heightScaleNode.setValue(200.0);

		this.exponentNode = LiteGraph.createNode("basic/const");
		this.exponentNode.title = "Exponent";
		this.exponentNode.pos = [550, 650];
		this.graph.add(this.exponentNode);
		this.exponentNode.setValue(3.0);

		this.powFilterNode = LiteGraph.createNode("heightmap/powFilter");
		this.powFilterNode.pos = [800, 600];
		this.graph.add(this.powFilterNode);

		this.perlinNode = LiteGraph.createNode("heightmap/cellularNoise");
		this.perlinNode.pos = [500,500];
		this.graph.add(this.perlinNode);

		this.exponentNode.connect(0, this.powFilterNode, 1);

		var idx = 0;
		// Sample nodes in order
		this.sizeNode.connect(0, this.perlinNode, idx++ );
		this.amplitudeNode.connect(0, this.perlinNode, idx++ );
		this.frequencyNode.connect(0, this.perlinNode, idx++ );
		this.octavesNode.connect(0, this.perlinNode, idx++ );
		this.heightScaleNode.connect(0, this.perlinNode, idx++ );

		this.outputNode = LiteGraph.createNode("heightmap/heightmapOutput");
		this.outputNode.pos = [1000,500];
		this.graph.add(this.outputNode);

		this.perlinNode.connect(0, this.powFilterNode, 0);
		this.powFilterNode.connect(0, this.outputNode, 0);

		// Setup renderer and camera
		this.renderer = new Renderer(this.glCanvas);
		this.camera.setPerspective(45.0, this.glCanvas.width / this.glCanvas.height, 0.1, 20000.0);
	    this.camera.setViewport(0, 0, this.glCanvas.width, this.glCanvas.height);

		var self = this;
		var wireframeButton = document.getElementById("wireframeButton")
		wireframeButton.onclick = function() {
			if (self.renderer.terrain.showWireframe) {
				self.renderer.terrain.showWireframe = 0;
				wireframeButton.textContent  = "Wireframe: OFF";
			} else {
				self.renderer.terrain.showWireframe = 1;
				wireframeButton.textContent  = "Wireframe: ON";
			}
		};

		var runStepButton = document.getElementById("runStepButton")
		runStepButton.onclick = function() {
			self.graph.runStep();
			self.renderer.buildTerrain();
		};

		var centerCameraButton = document.getElementById("centerCameraButton")
		centerCameraButton.onclick = function() {
			self.centerCamera()
		};

		var saveButton = document.getElementById("saveButton")
		saveButton.onclick = function() {
			var a = document.createElement('a');
			var json = JSON.stringify( self.graph.serialize() );
			a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(json));
			a.setAttribute('download', "Workflow.json");
			a.click()
		};

		var loadFile = document.getElementById("loadFile")
		loadFile.addEventListener('change', function() {
			var url = window.URL.createObjectURL(loadFile.files[0]);
			self.graph.load(url);
		});

		mainLoop();
	},
	centerCamera: function() {
		this.camera.eye = new vec3(0, this.renderer.terrain.radious * 1.5, this.renderer.terrain.radious * 2.5);

		var dir = vec3.vec3Sub(new vec3(0,0,0), this.camera.eye).normalize();

		var pitch = Math.asin(dir.y);
		var yaw = Math.acos(dir.x/Math.cos(pitch));

		this.camera.setYawPitch(-Math.toDegrees(yaw), Math.toDegrees(pitch));
	}
};

function mainLoop() {

	Editor.stats.begin();

	Editor.mouseDelta.x = Editor.prevMousePos.x - Editor.mousePos.x;
	Editor.mouseDelta.y = Editor.prevMousePos.y - Editor.mousePos.y;

	Editor.prevMousePos.x = Editor.mousePos.x;
	Editor.prevMousePos.y = Editor.mousePos.y;

	if (Editor.currentKeys["shift"] === true) {
		var vel = 10.0;
	} else {
		var vel = 5.0;
	}

	if (Editor.currentKeys["w"] === true)
		Editor.camera.eye.add(vec3.vec3Normalize(Editor.camera.front).multiplyScalar(vel));
	if (Editor.currentKeys["s"] === true)
		Editor.camera.eye.sub(vec3.vec3Normalize(Editor.camera.front).multiplyScalar(vel));
	if (Editor.currentKeys["a"] === true)
		Editor.camera.eye.sub(vec3.vec3Normalize(Editor.camera.front.cross(Editor.camera.up)).multiplyScalar(vel));
	if (Editor.currentKeys["d"] === true)
		Editor.camera.eye.add(vec3.vec3Normalize(Editor.camera.front.cross(Editor.camera.up)).multiplyScalar(vel));

	if (Editor.isLeftClicking)
		Editor.camera.addYawPitch(-Editor.mouseDelta.x * 0.2, Editor.mouseDelta.y * 0.2);

	Editor.camera.update();

	Editor.renderer.render(Editor.camera);

	Editor.stats.end();

	requestAnimationFrame(mainLoop);
}

window.addEventListener("resize", function(event) {

	Editor.glCanvas.width = window.innerWidth
	Editor.glCanvas.height = window.innerHeight

	Editor.camera.setPerspective(45.0, Editor.glCanvas.width / Editor.glCanvas.height, 0.1, 20000.0);
	Editor.camera.setViewport(0, 0, Editor.glCanvas.width, Editor.glCanvas.height);

});

Editor.glCanvas.addEventListener("mousemove", function(event) {

	Editor.mousePos.x = event.clientX;
	Editor.mousePos.y = event.clientY;

});

Editor.glCanvas.addEventListener("mousedown", function(event) {
    if (event.which === 1) {
		Editor.isLeftClicking = true;
    }
});

Editor.glCanvas.addEventListener("mouseup", function(event) {
    if (event.which === 1) {
		Editor.isLeftClicking = false;
    }
});

document.addEventListener("keydown", function (event) {

	Editor.currentKeys[event.key.toLowerCase()] = true;

}, true);

document.addEventListener("keyup", function (event) {

	Editor.currentKeys[event.key.toLowerCase()] = false;

}, true);
