import util from '../util.js';
import {colorOffset as shader} from './shaders.js'

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
    const u_resolution = gl.getUniformLocation(program, 'u_resolution');
    const u_offset = gl.getUniformLocation(program, 'u_offset');

    const a_position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 4, 0);
    const a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(a_texCoord);
    gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, f32size * 2);

    gl.uniformMatrix4fv(u_projection, false, projectionMat);

    function setResolution (width, height) {
        gl.uniform2f(u_resolution, width, height);
    }

    function setProjection (mat) {
        gl.uniformMatrix4fv(u_projection, false, mat);
    }

    function setOffset(offsetX, offsetY) {
        let offset = new Float32Array([offsetX, offsetY]);
        gl.uniform1fv(u_offset, offset);
    }


    return {
        setResolution,
        setProjection,
        setOffset,
        program
    }
}