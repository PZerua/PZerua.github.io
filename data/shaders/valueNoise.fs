#version 300 es

precision highp float;

in vec2 oUvs;

layout(location = 0) out vec4 fragColor;

uniform int u_octaves;
uniform float u_amplitude;
uniform float u_frequency;

float hash(vec2 p)
{
    p = 50.0*fract( p*0.3183099 + vec2(0.71,0.113));
    return -1.0+2.0*fract( p.x*p.y*(p.x+p.y) );
}

float noise( in vec2 p )
{
    vec2 i = floor( p );
    vec2 f = fract( p );

    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( hash( i + vec2(0.0,0.0) ),
                     hash( i + vec2(1.0,0.0) ), u.x),
                mix( hash( i + vec2(0.0,1.0) ),
                     hash( i + vec2(1.0,1.0) ), u.x), u.y);
}

void main (void)
{
    vec2 uv = oUvs;

    float f = 0.0;

    float amplitude = u_amplitude;

    uv *= u_frequency;

    for (int i = 0; i < u_octaves; i++) {
        f  += amplitude * noise( uv ); uv *= 2.0;
        amplitude /= 2.0;
    }

    f = 0.5 + 0.5*f;

    fragColor = vec4( f, f, f, 1.0 );
}
