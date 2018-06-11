#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec2 oUvs;

uniform sampler2D u_heightmapTexture;
uniform float u_from;
uniform float u_to;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

void main (void)
{
    float f = texture(u_heightmapTexture, oUvs).r;

    f = map(f, 0.0, 1.0, u_from, u_to);

    fragColor = vec4(vec3(f), 1.0);
}
