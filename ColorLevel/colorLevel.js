import util from '../util.js';

const shaders = {
    vertexShader: `
    attribute vec4 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position * vec4(1, -1, 1, 1);
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader: `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform float u_high[3];
    uniform float u_mid[3];
    uniform float u_low[3];
    void main () {
        vec4 color = texture2D(u_texture, v_texCoord);
        float r = color.r;
        float g = color.g;
        float b = color.b;
        if (r <= u_mid[0]) {
            r = (r - u_low[0]) / (u_mid[0] - u_low[0]) * 0.5;
        } else {
            r = (r - u_mid[0]) / (u_high[0] - u_mid[0]) * 0.5 + (127.0 / 255.0);
        }
        
        if (g <= u_mid[1]) {
            g = (g - u_low[1]) / (u_mid[1] - u_low[1]) * 0.5;
        } else {
            g = (g - u_mid[1]) / (u_high[1] - u_mid[1]) * 0.5 + (127.0 / 255.0);
        }

        
        if (b <= u_mid[2]) {
            b = (b - u_low[2]) / (u_mid[2] - u_low[2]) * 0.5;
        } else {
            b = (b - u_mid[2]) / (u_high[2] - u_mid[2]) * 0.5 + (127.0 / 255.0);
        }
        gl_FragColor = vec4(r, g, b, color.a);
    }
    `
};

const width = 640;
const height = 360;
let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = width;
canvas.height = height;
let gl = canvas.getContext('webgl');
window.gl = gl;
window.canvas = canvas;
let program = util.initWebGL(gl, shaders.vertexShader, shaders.fragmentShader);
gl.useProgram(program);

const points = new Float32Array([
    0, 0, 0, 0,
    width, 0, 0, 0,
    width, height, 0, 0,
    width, height, 0, 0,
    0, height, 0, 0,
    0, 0, 0, 0
]);



for (let i = 0; i < points.length; i += 4) {
    points[i + 2] = points[i] / width;
    points[i + 3] = points[i + 1] / height;
}

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);


let f32size = Float32Array.BYTES_PER_ELEMENT;
let texture = util.createTexture(gl);
let a_position = gl.getAttribLocation(program, 'a_position');
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 4, 0);
gl.enableVertexAttribArray(a_position);

let a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, 2 * f32size);
gl.enableVertexAttribArray(a_texCoord);

let u_projection = gl.getUniformLocation(program, 'u_projection');
let projectionMat = util.createProjection(width, height, 1);
gl.uniformMatrix4fv(u_projection, false, projectionMat);


let rgbLevel = [[0, 0, 0], [128, 128, 128], [255, 255, 255]];
let u_high = gl.getUniformLocation(program, 'u_high');
let u_mid = gl.getUniformLocation(program, 'u_mid');
let u_low = gl.getUniformLocation(program, 'u_low');

let highLevel = rgbLevel[2];
let midLevel = rgbLevel[1];
let lowLevel = rgbLevel[0];

gl.uniform1fv(u_high, highLevel);
gl.uniform1fv(u_mid, midLevel);
gl.uniform1fv(u_low, lowLevel);

let image = new Image();
image.src = '../assets/gaoda1.jpg';

function draw() {
    
    highLevel = rgbLevel[2].map(item => item / 255);
    midLevel = rgbLevel[1].map(item => item / 255);
    lowLevel = rgbLevel[0].map(item => item / 255);

    gl.uniform1fv(u_high, highLevel);
    gl.uniform1fv(u_mid, midLevel);
    gl.uniform1fv(u_low, lowLevel);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}


image.onload = function () {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    draw();
}
let state = -1;



canvas.onclick = function (e) {
    let x = e.offsetX;
    let y = height - e.offsetY;
    let rgba = new Uint8Array(4);
    draw();
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
    let currentColor;
    if (state === -1) {
        currentColor = lowColor;
        rgbLevel[0][0] = rgba[0];
        rgbLevel[0][1] = rgba[1];
        rgbLevel[0][2] = rgba[2];
    } else if (state === 0) {
        currentColor = midColor;
        rgbLevel[1][0] = rgba[0];
        rgbLevel[1][1] = rgba[1];
        rgbLevel[1][2] = rgba[2];
    } else if (state === 1) {
        currentColor = highColor;
        rgbLevel[2][0] = rgba[0];
        rgbLevel[2][1] = rgba[1];
        rgbLevel[2][2] = rgba[2];
    }
    draw();
    currentColor.style.backgroundColor = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`
    console.log(rgbLevel);

}



let low = document.createElement('div');
low.classList.add('low');
let lowBtn = document.createElement('button');
lowBtn.classList.add('low-btn');
lowBtn.textContent = '暗场';
let lowColor = document.createElement('div');
lowColor.classList.add('low-color');
low.appendChild(lowBtn);
low.appendChild(lowColor);


let mid = document.createElement('div');
mid.classList.add('mid');
let midBtn = document.createElement('button');
midBtn.classList.add('mid-btn');
midBtn.textContent = '灰度场';
let midColor = document.createElement('div');
midColor.classList.add('mid-color');
mid.appendChild(midBtn);
mid.appendChild(midColor);

let high = document.createElement('div');
high.classList.add('high');
let highBtn = document.createElement('button');
highBtn.classList.add('high-btn')
highBtn.textContent = '明场';
let highColor = document.createElement('div');
highColor.classList.add('high-color');
high.appendChild(highBtn);
high.appendChild(highColor);


document.body.appendChild(low);
document.body.appendChild(mid);
document.body.appendChild(high);



lowBtn.onclick = function () {
    state = -1;
}

midBtn.onclick = function () {
    state = 0;
}

highBtn.onclick = function () {
    state = 1;
}
