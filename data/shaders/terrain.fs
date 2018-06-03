#version 300 es

precision highp float;

in vec3 oBarycentric;

out vec4 fragColor;
in vec3 oVertex;
in vec2 oUvs;

uniform vec3 u_eye;

uniform sampler2D u_heightmapTexture;
uniform sampler2D u_normalsTexture;
uniform sampler2D u_colorTexture;

uniform bool u_showWireframe;

float edgeFactor()
{
    vec3 d = fwidth(oBarycentric);
    vec3 a3 = smoothstep(vec3(0.0), d*1.1, oBarycentric);
    return min(min(a3.x, a3.y), a3.z);
}

void main (void)
{
    vec3 light = vec3(512, 512, 512);

    vec4 heightmapTex = texture(u_colorTexture, oUvs);
    vec4 normalsTex = texture(u_normalsTexture, oUvs);

    vec4 diffuse = vec4(0.0, 0.0, 0.0, 1.0);
    vec3 N = normalsTex.rgb;
    vec3 L = normalize(light - oVertex);
    vec3 R = normalize(reflect(-L, N));
    vec3 V = normalize(u_eye - oVertex);

    diffuse.rgb = clamp( vec3(0.8, 0.8, 0.8) * max(dot(N,L), 0.0), 0.0, 1.0 );

    diffuse.rgb = 0.2 * vec3(0, 0.549, 0.619) + heightmapTex.rgb * diffuse.rgb;
    //diffuse.rgb = heightmapTex.rgb * diffuse.rgb;

    if (u_showWireframe) {
        fragColor = mix(vec4(0, 0.249, 0.319, 1.0), diffuse, edgeFactor());
    } else {
        fragColor = diffuse;
    }

    //fragColor = vec4(heightmapTex.rrr, 1.0);
    //fragColor = normalsTex;

}
