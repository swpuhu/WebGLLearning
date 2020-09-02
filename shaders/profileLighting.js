export const vertexShader = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main () {
        gl_Position = a_position;
        v_texCoord = a_texCoord;
    }
`;

export const fragmentShader = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform sampler2D u_texture;
    uniform float u_lightingWidth;
    uniform vec4 u_color;
    uniform float u_innerWidth;
    varying vec2 v_texCoord;
    const float maxSize = 200.0;

    void main () {
        float a = 0.0;
        float aa = 0.0;
        vec2 uv = v_texCoord;
        for (float y = -maxSize; y <= maxSize; y++) {
            if (abs(y) > u_lightingWidth) continue;
            for (float x = -maxSize; x < maxSize ;x++) {
                vec4 temp = texture2D(u_texture, uv + vec2(x, y) / u_resolution);
                if (abs(x) < u_innerWidth && abs(y) < u_innerWidth) {
                    a = max(a, temp.a);
                }
                if (abs(x) > u_lightingWidth) continue;
                float d = max(abs(x), abs(y));
                aa += temp.a * (1.0 - smoothstep(0.0, u_lightingWidth, d));
            }
        }
        aa = clamp(aa / (u_lightingWidth * u_lightingWidth), 0.0, 1.0);
        vec4 texColor = texture2D(u_texture, uv);
        vec4 edgeColor = vec4(u_color.rgb * a, a);
        vec4 lightingColor = vec4(u_color.rgb * aa, aa);
        vec4 color = edgeColor * edgeColor.a + lightingColor * (1. - edgeColor.a);
        gl_FragColor = texColor * texColor.a + color * (1. - texColor.a);
    }
`;