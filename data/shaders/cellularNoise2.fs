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

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

float noise(vec2 uv) {
    // Position in grid
    vec2 i = floor( uv );
    // Offset in position
    vec2 f = fract( uv );

    float m_dist = 1.;  // last minimum distance
    float m_dist2 = 1.;  // minimum distance before last

    for (int y= -1; y <= 1; y++) {
        for (int x= -1; x <= 1; x++) {
            // Neighbor place in the grid
            vec2 neighbor = vec2(float(x),float(y));

            // Random position from current + neighbor place in the grid
            vec2 point = random2(i + neighbor);

            // Vector between the pixel and the point
            vec2 diff = neighbor + point - f;

            // Distance to the point
            float dist = length(diff);

            // Keep the closer distance
            if (dist < m_dist) {
                m_dist2 = m_dist;
                m_dist = dist;
            }
            else if (dist < m_dist2) {
                m_dist2 = dist;
            }
        }
    }

    return m_dist2 - m_dist;
}

// Fractional Brownian Motion, generates fractal noise
float fbm(in vec2 uv) {
    float f = 0.0;

    // Apply offset to generation
    uv.x += u_xOffset;
    uv.y += u_yOffset;

    // Apply frequency
    uv *= u_frequency;

    float amplitude = u_amplitude * 0.65;
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

    fragColor = vec4(c, c, c, 1.0);
}
