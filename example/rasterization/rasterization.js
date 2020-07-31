import glUtil from '../../util.js';
import { vertexShader as colorVertexShader, fragmentShader as colorFragmentShader } from '../shaders/multiPointColor.js';
import { vertexShader as mosaicVertexShader, fragmentShader as mosaicFragmentShader } from '../shaders/mosaic.js'
import util from '../../util.js';
const width = 640;
const height = 360;
let canvasgl = document.createElement('canvas');
document.body.appendChild(canvasgl);
canvasgl.classList.add('webgl');
canvasgl.width = width;
canvasgl.height = height;



const button = document.createElement('input');
button.type = 'checkbox';
button.checked = false;

document.body.appendChild(button);
const z = 10;
const gl = canvasgl.getContext('webgl');
const trianglePointBufferData = new Float32Array([
    100, 0, z,
    width - 100, 0, z,
    width / 2, height, z
]);
const fullScreenPointBufferData = new Float32Array([
    0, 0, z,
    width, 0, z,
    width, height, z,
    width, height, z,
    0, height, z,
    0, 0, z
]);


const colorBufferData = new Float32Array([
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    0.0, 0.0, 1.0, 1.0,
]);

const fullTexCoordBufferData = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);

const trianglePointBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, trianglePointBuffer);
gl.bufferData(gl.ARRAY_BUFFER, trianglePointBufferData, gl.STATIC_DRAW);

const fullScreenPointBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, fullScreenPointBuffer);
gl.bufferData(gl.ARRAY_BUFFER, fullScreenPointBufferData, gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colorBufferData, gl.STATIC_DRAW);


const fullTexCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, fullTexCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, fullTexCoordBufferData, gl.STATIC_DRAW);

const colorProgram = util.initWebGL(gl, colorVertexShader, colorFragmentShader);
const mosaicProgram = util.initWebGL(gl, mosaicVertexShader, mosaicFragmentShader);

const colorProgramInfo = {
    program: colorProgram,
    attribSetter: util.createAttributeSetters(gl, colorProgram),
    uniformSetter: util.createUniformSetters(gl, colorProgram),
    attributes: {
        a_position: {
            buffer: trianglePointBuffer,
            numComponents: 3
        },
        a_color: {
            buffer: colorBuffer,
            numComponents: 4
        }
    },
    uniforms: {
        u_projection: util.createProjection(width, height, z)
    }
}

const mosaicProgramInfo = {
    program: mosaicProgram,
    attribSetter: util.createAttributeSetters(gl, mosaicProgram),
    uniformSetter: util.createUniformSetters(gl, mosaicProgram),
    attributes: {
        a_position: {
            buffer: fullScreenPointBuffer,
            numComponents: 3
        },
        a_texCoord: {
            buffer: fullTexCoordBuffer,
            numComponents: 2
        }
    },
    uniforms: {
        u_projection: util.createProjection(width, height, z),
        u_width: 0.07,
        u_aspect: height / width,
        u_resolution: [width, height]
    }
}
const [frameBuffers, textures] = util.createFramebufferTexture(gl, 2, width, height);

gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[0]);
gl.useProgram(colorProgram);
util.setAttributes(colorProgramInfo.attribSetter, colorProgramInfo.attributes);
util.setUniforms(colorProgramInfo.uniformSetter, colorProgramInfo.uniforms);
gl.drawArrays(gl.TRIANGLES, 0, 3);
gl.bindTexture(gl.TEXTURE_2D, textures[0]);

gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.useProgram(mosaicProgram);
util.setAttributes(mosaicProgramInfo.attribSetter, mosaicProgramInfo.attributes);
util.setUniforms(mosaicProgramInfo.uniformSetter, mosaicProgramInfo.uniforms);
gl.drawArrays(gl.TRIANGLES, 0, 6);

button.onchange = function () {
    if (button.checked) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(colorProgram);
        util.setAttributes(colorProgramInfo.attribSetter, colorProgramInfo.attributes);
        util.setUniforms(colorProgramInfo.uniformSetter, colorProgramInfo.uniforms);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[0]);
        gl.useProgram(colorProgram);
        util.setAttributes(colorProgramInfo.attribSetter, colorProgramInfo.attributes);
        util.setUniforms(colorProgramInfo.uniformSetter, colorProgramInfo.uniforms);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindTexture(gl.TEXTURE_2D, textures[0]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(mosaicProgram);
        util.setAttributes(mosaicProgramInfo.attribSetter, mosaicProgramInfo.attributes);
        util.setUniforms(mosaicProgramInfo.uniformSetter, mosaicProgramInfo.uniforms);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}