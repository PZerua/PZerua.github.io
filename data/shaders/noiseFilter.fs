#version 300 es

precision highp float;

in vec2 oUvs;

layout(location = 0) out vec4 fragColor;

uniform sampler2D u_heightmapTexture;
uniform float u_amplitude;
uniform float u_frequency;

float hash(vec2 p)
{
    p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
    return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float noise( in vec2 p )
{
    // Offset in position
    vec2 f = fract( p );

    vec2 u = f*f*(3.0-2.0*f);

    // Return white nosie
    return hash(u);
}

void main()
{
    vec2 uv = oUvs;

    float f = texture(u_heightmapTexture, oUvs).r;
    float amplitude = u_amplitude * 0.01;

    uv *= u_frequency;

    f += amplitude * noise( 32.0*uv );

    fragColor = vec4(f, f, f, 1.0);
}
