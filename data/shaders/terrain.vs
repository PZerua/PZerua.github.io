#version 300 es

layout (location = 0) in vec3 aVertex;
layout (location = 1) in vec2 aUvs;
layout (location = 2) in vec3 aBarycentric;

out vec3 oBarycentric;
out vec3 eye_relative_position;
out vec3 oVertex;
out vec2 oUvs;

uniform mat4 u_mvp;
uniform sampler2D u_heightmap;
uniform float u_heightmapScale;

void main(void)
{
	float height = texture(u_heightmap, aUvs).r;

	// Map to range -1 - 1
	height = height * 2.0 - 1.0;

	oVertex = aVertex;
	oUvs = aUvs;
	oVertex.y = height * u_heightmapScale;

	oBarycentric = aBarycentric;
	gl_Position = u_mvp * vec4( oVertex, 1.0 );
}
