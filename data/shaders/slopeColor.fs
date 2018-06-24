#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec2 oUvs;

uniform sampler2D u_heightmapTexture;
uniform float u_size;
uniform float u_heightScale;
uniform vec3 u_color0;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform float u_dispersion;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
    return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

void main (void)
{
    vec2 dU = vec2(1.0 / u_size, 0.0);
    vec2 dV = vec2(0.0, 1.0 / u_size);

    float hL = u_heightScale * texture(u_heightmapTexture, oUvs - dU).r;
    float hR = u_heightScale * texture(u_heightmapTexture, oUvs + dU).r;

    float hU = u_heightScale * texture(u_heightmapTexture, oUvs - dV).r;
    float hD = u_heightScale * texture(u_heightmapTexture, oUvs + dV).r;

    vec3 normal = normalize(vec3(hL - hR, 2.0, hU - hD));

    vec3 upNorm = normalize(vec3(0, 1, 0));

    float f = dot(normal, upNorm);

    vec3 color;
    if (f < 0.25 - u_dispersion) {
        color = mix(vec3(0.0, 0.0, 0.0), u_color0, map(f, 0.0, 0.25 - u_dispersion, 0.0, 1.0));
    }
    else if (f >= 0.25 - u_dispersion && f < 0.25 + u_dispersion) {
        color = mix(u_color0, u_color1, map(f, 0.25 - u_dispersion, 0.25 + u_dispersion, 0.0, 1.0));
    }
    else if (f >= 0.25 + u_dispersion && f < 0.50 - u_dispersion) {
        color = u_color1;
    }
    else if (f >= 0.50 - u_dispersion && f < 0.50 + u_dispersion) {
        color = mix(u_color1, u_color2, map(f, 0.50 - u_dispersion, 0.50 + u_dispersion, 0.0, 1.0));
    }
    else if (f >= 0.50 + u_dispersion && f < 0.75 - u_dispersion) {
        color = u_color2;
    }
    else if (f >= 0.75 - u_dispersion && f < 0.75 + u_dispersion) {
        color = mix(u_color2, u_color3, map(f, 0.75 - u_dispersion, 0.75 + u_dispersion, 0.0, 1.0));
    }
    else if (f >= 0.75 + u_dispersion) {
        color = u_color3;
    }

    fragColor = vec4(color, 1.0);
}
