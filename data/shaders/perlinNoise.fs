#version 300 es

precision highp float;

in vec2 oUvs;

layout(location = 0) out vec4 fragColor;

uniform int u_octaves;
uniform float u_amplitude;
uniform float u_frequency;

vec3 hash( vec3 p )
{
	p = vec3( dot(p,vec3(127.1,311.7, 74.7)),
			  dot(p,vec3(269.5,183.3,246.1)),
			  dot(p,vec3(113.5,271.9,124.6)));
	p = -1.0 + 2.0*fract(sin(p) * 43758.5453123);

	return p;
}

float noise( in vec3 p )
{
    // Position in grid
    vec3 i = floor( p );
    // Offset in position
    vec3 f = fract( p );

    // Quintic interpolation
	vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    //vec3 u = f*f*(3.0-2.0*f);

    // Interpolate in x axis and z = 0
    float u000 = mix(dot(hash(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)), dot(hash(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x);
    float u010 = mix(dot(hash(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)), dot(hash(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x);

    // Interpolate in y axis and z = 0
    float u110 = mix(u000, u010, u.y);

    // Interpolate in x axis and z = 1
    float u001 = mix(dot(hash(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)), dot(hash(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x);
    float u011 = mix(dot(hash(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)), dot(hash(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x);

    // Interpolate in y axis and z = 1
    float u111 = mix(u001, u011, u.y);

    return mix(u110, u111, u.z );
}

void main()
{
    vec2 uv = oUvs;

    float amplitude = u_amplitude;

    vec3 q = u_frequency*vec3(uv, 20.0);

    float f = 0.0;

    for (int i = 0; i < u_octaves; i++) {
        f  += amplitude * noise( q ); q *= 2.0;
        amplitude /= 2.0;
    }

    f = smoothstep( -0.7, 0.7, f );

    //f = 0.5 + 0.5*f;


    //f = 2.0*f - 1.0;

    fragColor = vec4(f, f, f, 1.0);

    //fragColor = vec4(f);
}
