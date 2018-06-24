#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec2 oUvs;

uniform sampler2D u_heightmapTexture0;
uniform sampler2D u_heightmapTexture1;

void main (void)
{
    vec3 f0 = texture(u_heightmapTexture0, oUvs).rgb;
    vec3 f1 = texture(u_heightmapTexture1, oUvs).rgb;

    vec3 f = min(f0, f1);

    fragColor = vec4(f, 1.0);
}
