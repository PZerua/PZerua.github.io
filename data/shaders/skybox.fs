#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec3 oUvs;

uniform samplerCube u_skybox;

void main (void)
{
    fragColor = texture(u_skybox, oUvs);
}
