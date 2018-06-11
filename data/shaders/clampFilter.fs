#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec2 oUvs;

uniform sampler2D u_heightmapTexture;
uniform float u_from;
uniform float u_to;

void main (void)
{
    float f = texture(u_heightmapTexture, oUvs).r;

    f = clamp(f, u_from, u_to);

    fragColor = vec4(vec3(f), 1.0);
}
