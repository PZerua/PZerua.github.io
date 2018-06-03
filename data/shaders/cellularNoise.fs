#version 300 es

precision highp float;

in vec2 oUvs;

layout(location = 0) out vec4 fragColor;

uniform int u_octaves;
uniform float u_amplitude;
uniform float u_frequency;

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float noise(vec2 st) {
    // Tile the space
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1.;  // minimun distance

    for (int y= -1; y <= 1; y++) {
        for (int x= -1; x <= 1; x++) {
            // Neighbor place in the grid
            vec2 neighbor = vec2(float(x),float(y));

            // Random position from current + neighbor place in the grid
            vec2 point = random2(i_st + neighbor);

            // Vector between the pixel and the point
            vec2 diff = neighbor + point - f_st;

            // Distance to the point
            float dist = length(diff);

            // Keep the closer distance
            m_dist = min(m_dist, dist);
        }
    }

    return m_dist;
}

void main() {
    vec2 uv = oUvs;

    uv += 1.0;

    float f = 0.0;
    float amplitude = 0.65 * u_amplitude;

    uv *= u_frequency;
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );

    for (int i = 0; i < u_octaves; i++) {
        f  += amplitude * noise( uv ); uv = m*uv;
        amplitude /= 2.0;
    }

    //f = f * f * f;

    fragColor = vec4(f, f, f, 1.0);
}
