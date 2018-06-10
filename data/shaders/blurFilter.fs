#version 300 es

precision highp float;

layout(location = 0) out vec4 fragColor;

in vec2 oUvs;

uniform sampler2D u_heightmapTexture;
uniform float u_radius;
uniform float u_size;

void main()
{
    // The strength of the blur
    float offset = u_radius / u_size;

    vec2 offsets[9];
    offsets[0] = vec2(-offset,  offset); // top-left
    offsets[1] = vec2( 0.0f,    offset); // top-center
    offsets[2] = vec2( offset,  offset); // top-right
    offsets[3] = vec2(-offset,  0.0f);   // center-left
    offsets[4] = vec2( 0.0f,    0.0f);   // center-center
    offsets[5] = vec2( offset,  0.0f);   // center-right
    offsets[6] = vec2(-offset, -offset); // bottom-left
    offsets[7] = vec2( 0.0f,   -offset); // bottom-center
    offsets[8] = vec2( offset, -offset); // bottom-right

    // Define weights of surrounding pixels
    float kernel[9];
    kernel[0] = 1.0 / 16.0;
    kernel[1] = 2.0 / 16.0;
    kernel[2] = 1.0 / 16.0;
    kernel[3] = 2.0 / 16.0;
    kernel[4] = 4.0 / 16.0;
    kernel[5] = 2.0 / 16.0;
    kernel[6] = 1.0 / 16.0;
    kernel[7] = 2.0 / 16.0;
    kernel[8] = 1.0 / 16.0;

    vec3 sampleTex[9];
    for(int i = 0; i < 9; i++)
    {
        sampleTex[i] = texture(u_heightmapTexture, oUvs + offsets[i]).rgb;
    }

    vec3 col = vec3(0.0);
    for(int i = 0; i < 9; i++)
    {
        col += sampleTex[i] * kernel[i];
    }

    fragColor = vec4(col, 1.0);
}
