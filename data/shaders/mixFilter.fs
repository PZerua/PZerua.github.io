#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec2 oUvs;

uniform sampler2D u_heightmapTexture0;
uniform sampler2D u_heightmapTexture1;

uniform float u_threshold;

void main (void)
{
    float f0 = texture(u_heightmapTexture0, oUvs).r;
    float f1 = texture(u_heightmapTexture1, oUvs).r;

    float f = mix(f0, f1, u_threshold);

    fragColor = vec4(vec3(f), 1.0);
}
