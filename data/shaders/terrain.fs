#version 300 es

precision highp float;

in vec3 oBarycentric;

out vec4 fragColor;
in vec3 oVertex;
in vec2 oUvs;

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
    vec3 diffuse;
	vec3 specular = vec3(0.0);
	vec3 ambient = vec3(0.1, 0.1, 0.15);

    vec4 colorTex = texture(u_colorTexture, oUvs);
    vec4 heightmapTex = texture(u_heightmapTexture, oUvs);
    vec4 normalsTex = texture(u_normalsTexture, oUvs);

    vec3 N = normalsTex.rgb;
    vec3 L = normalize(vec3(0.5, 1.2, 0.5));

    diffuse = clamp( colorTex.rgb * max(dot(N,L), 0.0), 0.0, 1.0 );

    vec3 color = ambient + diffuse;

    if (u_showWireframe) {
        fragColor = vec4(mix(vec3(0, 0.249, 0.319), color, edgeFactor()), 1.0);
    } else {
        fragColor = vec4(color, 1.0);
    }
}
