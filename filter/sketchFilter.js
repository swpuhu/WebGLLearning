import util from '../util.js';
import {sketch as shader} from './shaders.js'

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

    
    const signleStepOffset = gl.getUniformLocation(program, 'signleStepOffset');
    gl.uniform2f(signleStepOffset, 0.001, 0.00001);
    
    function setSingleStepOffset(x, y) {
        gl.uniform2f(signleStepOffset, x, y);
    }
    
    return {
        program,
        setSingleStepOffset
    }
}