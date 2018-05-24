#version 300 es

layout (location = 0) in vec3 aVertex;
layout (location = 1) in vec3 aColor;

flat out vec3 oColor;

uniform mat4 u_mvp;

void main(void)
{
	oColor = aColor;

	gl_Position = u_mvp * vec4(20.0f * aVertex, 1.0);
}
