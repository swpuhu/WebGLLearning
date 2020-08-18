import util from '../../util.js';
import { vertexShader, fragmentShader } from '../shaders/sampler.js';

const width = 640;
const height = 360;
let canvasgl = document.createElement('canvas');
document.body.appendChild(canvasgl);
canvasgl.classList.add('webgl');
canvasgl.width = width;
canvasgl.height = height;
const gl = canvasgl.getContext('webgl');

const fullScreenPointBufferData = new Float32Array([
    0, 0,
    width, 0,
    width, height,
    // width, height,
    0, height,
    0, 0,
]);
const fullTexCoordBufferData = new Float32Array([
    0.0, 0.0,
    2.0, 0.0,
    2.0, 2.0,
    // 2.0, 2.0,
    0.0, 2.0,
    0.0, 0.0
]);

const indexBufferData = new Uint8Array([
    0, 1, 2,
    2, 3, 4
])


const fullScreenPointBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, fullScreenPointBuffer);
gl.bufferData(gl.ARRAY_BUFFER, fullScreenPointBufferData, gl.STATIC_DRAW);

const fullTexCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, fullTexCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, fullTexCoordBufferData, gl.STATIC_DRAW);


const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexBufferData, gl.STATIC_DRAW);

const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

const program = util.initWebGL(gl, vertexShader, fragmentShader);
const programInfo = {
    program: program,
    attributeSetter: util.createAttributeSetters(gl, program),
    uniformSetter: util.createUniformSetters(gl, program),
    attributes: {
        a_position: {
            buffer: fullScreenPointBuffer,
            numComponents: 2
        },
        a_texCoord: {
            buffer: fullTexCoordBuffer,
            numComponents: 2
        }
    },
    uniforms: {
        u_projection: util.createProjection(width, height, 10)
    }
}

let image = new Image();
image.src = 'http://localhost:9000/WebGLLearning/assets/gaoda2.png';
image.onload = () => {
    draw();
}

function draw() {
    gl.useProgram(program);
    util.setAttributes(programInfo.attributeSetter, programInfo.attributes);
    util.setUniforms(programInfo.uniformSetter, programInfo.uniforms);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    // gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

}
