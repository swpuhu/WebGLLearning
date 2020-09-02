import util from '../../util.js';
import {vertexShader as normalVertex, fragmentShader as normalFragment} from '../shaders/normalTexture.js';
import {vertexShader as lightingVertex, fragmentShader as lightingFragment} from '../../shaders/profileLighting.js';
import {vertexShader as blendVertex, fragmentShader as blendFragment} from '../../shaders/blendLayer.js';
const width = 500;
const height = 400;

let canvasgl = document.createElement('canvas');
canvasgl.style.border = '1px solid #ccc';
canvasgl.classList.add('webgl');
canvasgl.width = width;
canvasgl.height = height;
let gl = canvasgl.getContext('webgl');
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

document.body.appendChild(canvasgl);

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
gl.clearColor(0.0, 0.0, 0.0, 0.0);
let points = new Float32Array([
    -0.5, -0.5,
    0.5, -0.5,
    0.5, 0.5,
    0.5, 0.5,
    -0.5, 0.5,
    -0.5, -0.5
]);

let fullScreenPoints = new Float32Array([
    -1.0, -1.0,
    1.0, -1.0,
    1.0, 1.0,
    1.0, 1.0,
    -1.0, 1.0,
    -1.0, -1.0
])
let texCoordPoints = new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0
]);

const pointsBuffer = util.createBuffer(gl, points);
const fullScreenPointsBuffer = util.createBuffer(gl, fullScreenPoints);
const texCoordPointsBuffer = util.createBuffer(gl, texCoordPoints);


const normalProgram = util.initWebGL(gl, normalVertex, normalFragment);
const lightingProgram = util.initWebGL(gl, lightingVertex, lightingFragment);
const blendProgram = util.initWebGL(gl, blendVertex, blendFragment);
const normalProgramInfo = {
    program: normalProgram,
    attributeSetter: util.createAttributeSetters(gl, normalProgram),
    uniformSetter: util.createUniformSetters(gl, normalProgram),
    attributes: {
        a_position: {
            buffer: pointsBuffer,
            numComponents: 2
        },
        a_texCoord: {
            buffer: texCoordPointsBuffer,
            numComponents: 2
        }
    },
    uniforms: {

    },
    mode: gl.TRIANGLES,
    offset: 0,
    count: 6
};

const lightingProgramInfo = {
    program: lightingProgram,
    attributeSetter: util.createAttributeSetters(gl, lightingProgram),
    uniformSetter: util.createUniformSetters(gl, lightingProgram),
    attributes: {
        a_position: {
            buffer: fullScreenPointsBuffer,
            numComponents: 2
        },
        a_texCoord: {
            buffer: texCoordPointsBuffer,
            numComponents: 2
        }
    },
    uniforms: {
        u_lightingWidth: 50,
        u_innerWidth: 7,
        u_resolution: [width, height],
        u_color: [0.8, 1.0, 0.4, 1.0],
        
    },
    mode: gl.TRIANGLES,
    offset: 0,
    count: 6
}

const blendProgramInfo = {
    program: blendProgram,
    attributeSetter: util.createAttributeSetters(gl, blendProgram),
    uniformSetter: util.createUniformSetters(gl, blendProgram),
    attributes: {
        a_position: {
            buffer: fullScreenPointsBuffer,
            numComponents: 2
        },
        a_texCoord: {
            buffer: texCoordPointsBuffer,
            numComponents: 2
        }
    },
    uniforms: {
        u_blend_type: 0
    },
    mode: gl.TRIANGLES,
    offset: 0,
    count: 6
}


const texture = util.createTexture(gl);
const image = new Image();
const [framebuffers, textures] = util.createFramebufferTexture(gl, 2, width, height);
image.src = '../../assets/text1.png';
image.onload = () => {
    gl.useProgram(normalProgram);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.disable(gl.BLEND);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    normalProgramInfo.attributes.a_position.buffer = fullScreenPointsBuffer;
    util.drawByProgramInfo(gl, normalProgramInfo);
    lightingProgramInfo.attributes.a_position.buffer = pointsBuffer;
    
    normalProgramInfo.attributes.a_position.buffer = pointsBuffer;

    util.drawByProgramInfo(gl, normalProgramInfo, framebuffers[0], textures[0]);
    // util.drawByProgramInfo(gl, normalProgramInfo);
    gl.enable(gl.BLEND);
    util.drawByProgramInfo(gl, lightingProgramInfo);
    // util.drawByProgramInfo(gl, lightingProgramInfo, framebuffers[1], textures[1]);
    
    lightingProgramInfo.attributes.a_position.buffer = fullScreenPointsBuffer;
    // gl.useProgram(blendProgram);
    // const u_texture1 = gl.getUniformLocation(blendProgram, 'u_texture1');
    // const u_texture2 = gl.getUniformLocation(blendProgram, 'u_texture2');
    // gl.uniform1i(u_texture1, 0);
    // gl.uniform1i(u_texture2, 1);

    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, textures[1]);

    // gl.activeTexture(gl.TEXTURE1);
    // gl.bindTexture(gl.TEXTURE_2D, textures[0]);

    // gl.enable(gl.BLEND);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // util.setAttributes(blendProgramInfo.attributeSetter, blendProgramInfo.attributes);
    // util.setUniforms(blendProgramInfo.uniformSetter, blendProgramInfo.uniforms);
    // gl.drawArrays(gl.TRIANGLES, 0, 6);
}
