import util from '../util.js';

const shader = {
    vertexShader: `
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color

    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
        v_color = a_color;
    }
    `,
    fragmentShader:  `
    precision mediump float;
    varying vec2 v_color;

    void main () {
        vec2 sampleDivisor = vec2(u_width * u_aspect, u_width);
        vec2 pos = v_texCoord - 1.0 / u_resolution;
        vec2 samplePos = pos - mod(pos, sampleDivisor) + ( 0.5 * sampleDivisor);
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

    const a_color = gl.getActiveAttrib


    function setFraction(width, aspect) {
        gl.uniform1f(u_width, width);
        gl.uniform1f(u_aspect, aspect);

    }


    return {
        program,
    }
}