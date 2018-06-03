#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec2 oUvs;

uniform sampler2D u_heightmapTexture;
uniform float u_exponent;

void main (void)
{
    float f = texture(u_heightmapTexture, oUvs).r;

    f = pow(f, u_exponent);

    fragColor = vec4(vec3(f), 1.0);
}
