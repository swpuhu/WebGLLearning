import shader from './shaders/shader1.js';
import util from '../util.js';
const width = 640;
const height = 360;

const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl');

const program = util.initWebGL(gl, shader.turnpage_vert, shader.turnpage_frag);

const fullScreenPointBufferData = new Float32Array([
    0, 0, 1, 1,
    width, 0, 1, 1,
    width, height, 1, 1,
    width, height, 1, 1,
    0, height, 1, 1,
    0, 0, 1, 1,
]);

const fullTexCoordBufferData = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);


const colorBufferData = new Float32Array([
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
]);

const texture = util.createTexture(gl);

const fullScreenPointBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, fullScreenPointBuffer);
gl.bufferData(gl.ARRAY_BUFFER, fullScreenPointBufferData, gl.STATIC_DRAW);

const fullTexCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, fullTexCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, fullTexCoordBufferData, gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colorBufferData, gl.STATIC_DRAW);



const programInfo = {
    program: program,
    attribSetter: util.createAttributeSetters(gl, program),
    uniformSetter: util.createUniformSetters(gl, program),
    attributes: {
        a_position: {
            buffer: fullScreenPointBuffer,
            numComponents: 4
        },
        a_texCoord: {
            buffer: fullTexCoordBuffer,
            numComponents: 2
        }
    },
    uniforms: {
        CC_PMatrix: util.createProjection(width, height, 1),
        resolution: [width, height],
        mouse: [200, 100],
        u_test: 0.5
    }
}
gl.useProgram(program);
util.setAttributes(programInfo.attribSetter, programInfo.attributes);

util.setUniforms(programInfo.uniformSetter, programInfo.uniforms);

// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

let image = new Image();
image.src = 'http://localhost:9000/WebGLLearning/assets/gaoda3.jpg';
image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

