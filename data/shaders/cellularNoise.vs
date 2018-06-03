#version 300 es

layout (location = 0) in vec2 aVertex;

out vec2 oUvs;

void main(void)
{
    oUvs = aVertex;
	gl_Position = vec4( aVertex, 0.0, 1.0 );
}
