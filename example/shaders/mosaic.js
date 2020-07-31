export const vertexShader = `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;

    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        v_texCoord = a_texCoord;
    }
`

export const fragmentShader = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform float u_width;
    uniform float u_aspect;
    void main () {
        vec2 sampleDivisor = vec2(u_width * u_aspect, u_width);
        vec2 pos = v_texCoord - 1.0 / u_resolution;
        vec2 samplePos = pos - mod(pos, sampleDivisor) + ( 0.5 * sampleDivisor);
        gl_FragColor = texture2D(u_texture, samplePos);
    }
`