#version 300 es

precision highp float;

layout (location = 0) in vec2 aVertex;
layout (location = 1) in vec2 aUvs;

out vec2 oUvs;

void main(void)
{
    oUvs = aUvs;
	gl_Position = vec4( aVertex, 0.0, 1.0 );
}
