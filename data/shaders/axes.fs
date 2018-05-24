#version 300 es

precision highp float;

flat in vec3 oColor;
out vec4 color;

void main (void)
{
    color = vec4(oColor, 1.0);
}
