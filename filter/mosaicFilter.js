import util from '../util.js';

const shader = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;

    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader:  `#version 300 es
    precision mediump float;
    out vec4 out_color;
    in vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform float u_width;
    uniform float u_aspect;
    void main () {
        vec2 sampleDivisor = vec2(u_width * u_aspect, u_width);
        vec2 pos = v_texCoord - 1.0 / u_resolution;
        vec2 samplePos = pos - mod(pos - vec2(0.5, 0.5), sampleDivisor) + ( 0.5 * sampleDivisor);
        out_color = texture(u_texture, samplePos);
    }
    `
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {Float32Array} projectionMat
 */
export default function (gl, projectionMat) {
    
    let program = util.initWebGL(gl, shader.vertexShader, shader.fragmentShader);
    let f32size = Float32Array.BYTES_PER_ELEMENT;
    gl.useProgram(program);

    const u_projection = gl.getUniformLocation(program, 'u_projection');
    gl.uniformMatrix4fv(u_projection, false, projectionMat);

    const a_position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 4, 0);
    const a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(a_texCoord);
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, f32size * 2);

    const u_resolution = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);

    const u_texture = gl.getUniformLocation(program, 'u_texture');
    gl.uniform1i(u_texture, 0);

    const u_width = gl.getUniformLocation(program, 'u_width');
    gl.uniform1f(u_width, 0.5);


    const u_aspect = gl.getUniformLocation(program, 'u_aspect');
    gl.uniform1f(u_aspect, 9 / 16);


    function setFraction(width, aspect) {
        gl.uniform1f(u_width, width);
        gl.uniform1f(u_aspect, aspect);

    }


    return {
        program,
    }
}