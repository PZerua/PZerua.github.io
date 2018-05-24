#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec2 oUvs;

uniform sampler2D u_heightmapTexture;
uniform float u_size;
uniform float u_heightScale;

void main (void)
{
    vec2 dU = vec2(1.0 / u_size, 0.0);
    vec2 dV = vec2(0.0, 1.0 / u_size);

    float hL = u_heightScale * texture(u_heightmapTexture, oUvs - dU).r;
    float hR = u_heightScale * texture(u_heightmapTexture, oUvs + dU).r;

    float hU = u_heightScale * texture(u_heightmapTexture, oUvs - dV).r;
    float hD = u_heightScale * texture(u_heightmapTexture, oUvs + dV).r;

    vec3 normal = normalize(vec3(hL - hR, 2.0, hD - hU));

    normal.z = -normal.z;

    fragColor = vec4(normal, 1.0);
}
