import {vertexShader, fragmentShader} from '../shaders/normalShader.js';
import util from '../../util.js';

const width = 640;
const height = 360;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;

document.body.appendChild(canvas);
const gl = canvas.getContext('webgl');
const program = util.initWebGL(gl, vertexShader, fragmentShader);
const left = -width / 2;
const right = width / 2;
const top = height / 2;
const bottom = -height / 2;
const near = 400;
const far = 2000;
const z = 1000
const r = 500;
let halfCircle = [];
const line = [
    // 0, 0, z, 
    -500, 0, z,
    -500, 500, z,
    // 0, 500, z
];

for (let i = -90; i <= 90; i += 20) {
    let x = r * Math.cos(i * Math.PI / 180);
    let y = r * Math.sin(i * Math.PI / 180);
    halfCircle.push(x, y, z);
}
// console.log(halfCircle);

const lines = util.createRevolutionLinePoint(halfCircle, 20, {x: 0, y: 0, z: z}, 'y');
console.log(lines);
const fullScreenPointBufferData = new Float32Array([
    0, 0, z,
    width, 0, z,
    width, height, z,
    width, height, z,
    0, height, z,
    0, 0, z
]);

const fullScreenPointBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, fullScreenPointBuffer);
gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW);

const programInfo = {
    program: program,
    attribSetter: util.createAttributeSetters(gl, program),
    uniformSetter: util.createUniformSetters(gl, program),
    attributes: {
        a_position: {
            buffer: fullScreenPointBuffer,
            numComponents: 3
        }
    },
    uniforms: {
        u_perspective: util.createPerspective(near, far, left, right, top, bottom),
        u_scale: util.createScaleMatrix(1, 1, 1, {x: 0, y: 0, z: z}),
        u_rotateZ: util.createRotateMatrix({x: 0, y: 0, z: z}, 0, 'z'),
        u_rotateX: util.createRotateMatrix({x: 0, y: 0, z: z}, 30, 'x'),
        u_rotateY: util.createRotateMatrix({x: 0, y: 0, z: z}, 10, 'y'),
        u_translate: util.createTranslateMatrix(-200, 0, 500)
    }
}

gl.useProgram(program);

util.setAttributes(programInfo.attribSetter, programInfo.attributes);
util.setUniforms(programInfo.uniformSetter, programInfo.uniforms);

gl.drawArrays(gl.LINES, 0, lines.length / 3);



