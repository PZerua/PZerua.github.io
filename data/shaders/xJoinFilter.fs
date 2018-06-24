#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec2 oUvs;

uniform sampler2D u_heightmapTexture0;
uniform sampler2D u_heightmapTexture1;

uniform float u_offset;
uniform float u_threshold;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

void main (void)
{
    vec3 f0 = texture(u_heightmapTexture0, oUvs).rgb;
    vec3 f1 = texture(u_heightmapTexture1, oUvs).rgb;
    vec3 f = vec3(0.0);

    if (oUvs.x < u_offset - u_threshold / 2.0) {
        f = f0;
    }
    else if (oUvs.x >= u_offset - u_threshold / 2.0 && oUvs.x <= u_offset + u_threshold / 2.0) {
        f = mix(f0, f1, map(oUvs.x, u_offset - u_threshold / 2.0, u_offset + u_threshold / 2.0, 0.0, 1.0));
    }
    else if (oUvs.x > u_offset + u_threshold / 2.0) {
        f = f1;
    }

    fragColor = vec4(f, 1.0);
}
