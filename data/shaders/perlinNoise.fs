#version 300 es

precision highp float;

in vec2 oUvs;

layout(location = 0) out vec4 fragColor;

uniform int u_octaves;
uniform float u_amplitude;
uniform float u_frequency;
uniform float u_perturbation;
uniform float u_xOffset;
uniform float u_yOffset;

vec2 hash(vec2 x)
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}

float noise( in vec2 p )
{
	// Position in grid
	vec2 i = floor( p );
	// Offset in position
	vec2 f = fract( p );

	// Quintic interpolation
	vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

	// Interpolate in x axis
	float a = mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)), dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x);
	float b = mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x);

	// Interpolate in y axis
	return mix(a, b, u.y);
}

// Fractional Brownian Motion, generates fractal noise
float fbm(in vec2 uv) {
    float f = 0.0;

    // Apply offset to generation
    uv.x += u_xOffset;
    uv.y += u_yOffset;

    // Apply frequency
    uv *= u_frequency;

    float amplitude = u_amplitude;
    for (int i = 0; i < u_octaves; i++) {
        f  += amplitude * noise( uv ); uv = 2.0*uv;
        amplitude /= 2.0;
    }
    return f;
}

void main() {
    // Calculate perturbation offset
    vec2 q = vec2(fbm(oUvs + vec2(0.0,0.0) ),
               fbm(oUvs + vec2(5.2,1.3)));

    // Retreive color intensity with perturbation
    float c = fbm(oUvs + u_perturbation*q);

    // Map to range [0, 1]
    c = 0.5 + 0.5*c;

    fragColor = vec4(c, c, c, 1.0);
}
