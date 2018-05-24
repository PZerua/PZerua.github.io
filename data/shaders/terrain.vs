#version 300 es

layout (location = 0) in vec3 aVertex;
layout (location = 1) in vec2 aUvs;
layout (location = 2) in vec3 aBarycentric;
layout (location = 3) in vec3 aNormal;

out vec3 oBarycentric;
out vec3 normal;
out vec3 eye_relative_position;
out vec3 oVertex;
out vec2 oUvs;

uniform vec3 u_eye;
uniform mat4 u_mvp;
uniform mat4 u_view;
uniform sampler2D u_heightmap;
uniform float u_heightmapScale;

void main(void)
{
	float height = texture(u_heightmap, aUvs).r;

	height = height * 2.0 - 1.0;

	normal = aNormal;
	oVertex = aVertex;
	oUvs = aUvs;
	oVertex.y = height * u_heightmapScale;

	oBarycentric = aBarycentric;
	gl_Position = u_mvp * vec4( oVertex, 1.0 );
}
