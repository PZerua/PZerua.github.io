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
	terrainSize: 1024,
	calculatingImages: true,
	init : function() {

		// var container = document.getElementById("container")
		// this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		// this.stats.dom.style.position = "absolute";
		// container.appendChild( this.stats.dom );

		this.graphCanvas = new LGraphCanvas("#graphCanvas", this.graph);
		this.graphCanvas.resize();

		window.addEventListener("resize", function() { Editor.graphCanvas.resize(); } );

		// Setup litegraph default nodes
		//this.graph.load("data/SampleWorkflow.json");

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

		this.calculateButton = document.getElementById("calculateButton")
		this.calculateButton.onclick = function() {
			self.calculatingImages = true;
			self.graph.runStep();
			Editor.calculatingImages = false;
			Editor.setCalculateColor("#3F3F3F");
			//self.renderer.buildTerrain();
		};

		var centerCameraButton = document.getElementById("centerCameraButton")
		centerCameraButton.onclick = function() {
			self.centerCamera()
		};

		// Validate terrain size input
		this.terrainSizeInput = document.getElementById("terrainSize")
		this.terrainSizeInput.oninput = function() {
			if (this.value > 8192) {
				this.value = 8192;
			}
			// if (this.value < 4) {
			// 	this.value = 4;
			// }
		};

		this.demoSelector = document.getElementById("selector")
		this.demoSelector.onchange = function(e) {
			var option = this.options[this.selectedIndex];
			var url = option.dataset["url"];

			if(url) {
				var req = new XMLHttpRequest();
				req.open('GET', url, true);
				req.send(null);
				req.onload = function (oEvent) {
					if(req.status !== 200)
					{
						console.error("Error loading graph:", req.status,req.response);
						return;
					}
					var data = JSON.parse( req.response );

					// TODO: remove this backwards compatibility check
					if (data.constructor === Array) {
						Editor.graph.configure(data[0]);
						var size = data[1]
						self.terrainSizeInput.value = data[1];
						self.terrainSize = data[1];
					} else {
						Editor.graph.configure(data);
					}
					self.calculateButton.click();
					Editor.graph.start();
				}
			}
			else {
				self.graph.clear();
			}
		};

		function addDemo( name, url, selected )
		{
			var option = document.createElement("option");
			if (selected) {
				option.setAttribute('selected', 'selected');
			}
			option.value = name;
			option.dataset["url"] = url;
			option.innerHTML = name;
			self.demoSelector.appendChild( option );
		}

		//some examples
		addDemo("Simple Terrain", "data/Simple Terrain.json", true);
		addDemo("Mountains", "data/Mountains.json");

		this.demoSelector.onchange();

		var submitTerrainSize = document.getElementById("submitTerrainSize")
		submitTerrainSize.onclick = function() {

			var value = Number(self.terrainSizeInput.value);
			if (value < 128) {
				self.terrainSizeInput.value = 128;
				value = 128;
			}

			Editor.terrainSize = value;
			self.calculateButton.click();
		};

		var saveButton = document.getElementById("saveButton")
		saveButton.onclick = function() {
			var a = document.createElement('a');
			var json = JSON.stringify( [self.graph.serialize(), Editor.terrainSize] );
			a.setAttribute('href', 'data:text/plain;charset=utf-u,' + encodeURIComponent(json));
			a.setAttribute('download', "Workflow.json");
			a.click()
		};

		var loadFile = document.getElementById("loadFile")
		var count = 0;
		loadFile.addEventListener('change', function() {
			var url = window.URL.createObjectURL(loadFile.files[0]);

			var req = new XMLHttpRequest();
			req.open('GET', url, true);
			req.send(null);
			req.onload = function (oEvent) {
				if(req.status !== 200)
				{
					console.error("Error loading graph:", req.status,req.response);
					return;
				}
				var data = JSON.parse( req.response );

				// TODO: remove this backwards compatibility check
				if (data.constructor === Array) {
					Editor.graph.configure(data[0]);
					var size = data[1]
					self.terrainSizeInput.value = data[1];
					self.terrainSize = data[1];
				} else {
					Editor.graph.configure(data);
				}
				self.calculateButton.click();
				Editor.graph.start();
			}

			loadFile.value = "";
		});

		// Get file data on drop
		window.addEventListener('drop', function(e) {
		    e.stopPropagation();
		    e.preventDefault();
		    var files = e.dataTransfer.files; // Array of all files

		    for (var i=0, file; file=files[i]; i++) {
		        if (file.type.match(/image.*/)) {
		            var reader = new FileReader();

		            reader.onload = function(e2) {
		                // finished reading file data.
		                var img = document.createElement('img');
		                img.src= e2.target.result;
		                document.body.appendChild(img);
		            }

		            reader.readAsDataURL(file); // start reading the file data.
		        }
		    }
		});

		mainLoop();
	},
	centerCamera: function() {
		if (!this.renderer.terrain) {
			return false;
		}

		this.camera.eye = new vec3(0, this.renderer.terrain.radious * 1.5, this.renderer.terrain.radious * 2.5);

		var dir = vec3.vec3Sub(new vec3(0,0,0), this.camera.eye).normalize();

		var pitch = Math.asin(dir.y);
		var yaw = Math.acos(dir.x/Math.cos(pitch));

		this.camera.setYawPitch(-Math.toDegrees(yaw), Math.toDegrees(pitch));

		return true;
	},
	setCalculateColor: function(color) {
		this.calculateButton.style.backgroundColor = color;
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
