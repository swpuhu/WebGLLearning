import util from '../util.js';

const vertexShader = `
    attribute vec4 a_position;
    uniform mat4 u_matrix;
    uniform mat4 u_rotateX;
    uniform mat4 u_rotateY;
    varying vec3 v_normal;


    void main () {
        gl_Position = u_matrix * u_rotateX * u_rotateY * a_position;
        vec3 position = a_position.xyz;
        position.z = position.z - 10.;
        v_normal = normalize(position.xyz);
    }
`;

const fragmentShader = `
    precision mediump float;
    uniform samplerCube u_texture;
    varying vec3 v_normal;
    void main () {
        gl_FragColor = textureCube(u_texture, normalize(v_normal));
        // gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    }
`;


const width = 360;
const height = 360;
const canvas = document.createElement('canvas');;
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const offCanvas = document.createElement('canvas');
offCanvas.width = 128;
offCanvas.height = 128;
const ctx = offCanvas.getContext('2d');
const gl = canvas.getContext('webgl');
// gl.enable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
const program = util.initWebGL(gl, vertexShader, fragmentShader);
gl.useProgram(program);
const attributeSetter = util.createAttributeSetters(gl, program);
const uniformSetter = util.createUniformSetters(gl, program);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
setGeometry(gl);

const attributes = {
    a_position: {
        numComponents: 3,
        buffer: positionBuffer
    }
}
const near = 8;
const far = 12;
const left = -1;
const right = 1;
const bottom = -1;
const top = 1;
const uniforms = {
    u_matrix: util.createPerspective(near, far, left, right, top, bottom),
    u_rotateX: util.createRotateMatrix({x: 0, y: 0, z: 0}, 0, 'x'),
    u_rotateY: util.createRotateMatrix({x: 0, y: 0, z: 0}, 0, 'y'),
}


const faceInfos = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, faceColor: '#F00', textColor: '#0FF', text: '+X' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, faceColor: '#FF0', textColor: '#00F', text: '-X' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, faceColor: '#0F0', textColor: '#F0F', text: '+Y' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, faceColor: '#0FF', textColor: '#F00', text: '-Y' },
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, faceColor: '#00F', textColor: '#FF0', text: '+Z' },
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, faceColor: '#F0F', textColor: '#0F0', text: '-Z' },
];
faceInfos.forEach((faceInfo) => {
    const { target, faceColor, textColor, text } = faceInfo;
    generateFace(ctx, faceColor, textColor, text);
    const level = 0;
    const internalFormat = gl.RGBA;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    gl.texImage2D(target, level, internalFormat, format, type, ctx.canvas);
});

gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

function drawScence() {
    util.setAttributes(attributeSetter, attributes);
    util.setUniforms(uniformSetter, uniforms);
    gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {string} faceColor 
 * @param {string} textColor 
 * @param {string} text 
 */
function generateFace(ctx, faceColor, textColor, text) {
    const { width, height } = ctx.canvas;
    ctx.fillStyle = faceColor;
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${width * 0.7}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(text, width / 2, height / 2);
}


// Fill the buffer with the values that define a cube.
function setGeometry(gl) {
    var positions = new Float32Array(
        [
            -0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, 0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, -0.5,

            -0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, 0.5,

            -0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,
            -0.5, 0.5, 0.5,
            0.5, 0.5, 0.5,
            0.5, 0.5, -0.5,

            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, -0.5, 0.5,
            0.5, -0.5, -0.5,
            0.5, -0.5, 0.5,

            -0.5, -0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, -0.5,
            -0.5, -0.5, 0.5,
            -0.5, 0.5, 0.5,
            -0.5, 0.5, -0.5,

            0.5, -0.5, -0.5,
            0.5, 0.5, -0.5,
            0.5, -0.5, 0.5,
            0.5, -0.5, 0.5,
            0.5, 0.5, -0.5,
            0.5, 0.5, 0.5,

        ]);

        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 2] += 10;
        }
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

drawScence();

let then = 0;
function animate (time) {
    time *= 0.05;
    let deltaTime = time - then;
    then = time;
    uniforms.u_rotateX = util.createRotateMatrix({x: 0, y: 0, z: 10}, 0.7 * time, 'x');
    uniforms.u_rotateY = util.createRotateMatrix({x: 0, y: 0, z: 10}, 0.4 * time, 'y');
    drawScence();
    requestAnimationFrame(animate);
}

animate();