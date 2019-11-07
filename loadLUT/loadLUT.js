import util from '../util.js';

const shaders = {
    vertexShader: `#version 300 es
    in vec4 a_position;
    in vec2 a_texCoord;
    out vec2 v_texCoord;
    void main () {
        gl_Position = a_position * vec4(1.0, -1.0, 1.0, 1.0);
        v_texCoord = a_texCoord;
    }
    `,
    fragmentShader: `#version 300 es
    precision highp float;
    in vec2 v_texCoord;
    out vec4 out_color;
    uniform sampler2D u_texture;
    uniform sampler2D u_lut;
    void main () {
        vec4 textureColor = texture(u_texture, v_texCoord);
        float blueColor = textureColor.b;
        // 计算当前颜色在哪个格子
        float blueIndex = floor(blueColor * 63.0);

        // 根据当前格子的索引计算所在行、列数
        vec2 quad;
        quad.y = floor(blueIndex / 8.0);
        quad.x = (blueIndex - quad.y * 8.0);

        vec2 texPos;
        texPos.x = quad.x / 8.0 + 0.5 / 512.0 + ((0.125 - 1.0 / 512.0) * textureColor.r);
        texPos.y = quad.y / 8.0 + 0.5 / 512.0 + ((0.125 - 1.0 / 512.0) * textureColor.g);
        texPos.y = 1.0 - texPos.y;
        vec4 lutColor = texture(u_lut, texPos);
        if (lutColor.a == 0.0) {
            out_color = textureColor;
        } else {
            out_color = lutColor;
        }
        
    }
    `
}

const width = 640;
const height = 360;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl2');
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

const program = util.initWebGL(gl, shaders.vertexShader, shaders.fragmentShader);
gl.useProgram(program);

let points = new Float32Array([
    -1.0, -1.0, 0.0, 0.0,
    1.0, -1.0, 1.0, 0.0,
    1.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
    -1.0, 1.0, 0.0, 1.0,
    -1.0, -1.0, 0.0, 0.0
]);

let f32size = Float32Array.BYTES_PER_ELEMENT;
let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let a_position = gl.getAttribLocation(program, 'a_position');
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, f32size * 4, 0);
gl.enableVertexAttribArray(a_position);

let a_texCoord = gl.getAttribLocation(program, 'a_texCoord');
gl.vertexAttribPointer(a_texCoord, 2, gl.FLOAT, false, f32size * 4, f32size * 2);
gl.enableVertexAttribArray(a_texCoord);


let texture = util.createTexture(gl);
let lutTexture = util.createTexture(gl);

let u_texture = gl.getUniformLocation(program, 'u_texture');
let u_lut = gl.getUniformLocation(program, 'u_lut');
gl.uniform1i(u_texture, 0);
gl.uniform1i(u_lut, 1);

let image = new Image();
image.onload = function () {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

let lutImage = new Image();
lutImage.onload = function () {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, lutTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, lutImage);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}


image.src = '../assets/gaoda1.jpg';
lutImage.src = '../assets/Texture31.png';

let file = document.createElement('input');
file.type = 'file';
file.onchange = function () {
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, lutTexture);
    let url = URL.createObjectURL(this.files[0]);
    let i = new Image();
    i.onload = function () {
        URL.revokeObjectURL(url);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, i);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    i.src = url;
}

document.body.appendChild(file);

