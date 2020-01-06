import util from '../util.js';

const vertexShader = `
    attribute vec4 a_position;
    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
    }

`

const fragmentShader = `
    precision mediump float;
    uniform sampler2D u_texture;
    void main () {
        vec2 resolution = vec2(640.0, 360.0);
        vec2 pos = gl_FragCoord.xy / resolution;
        gl_FragColor = texture2D(u_texture, pos);
    }
`
const fragmentShader2 = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform sampler2D u_texture2;
    void main () {
        vec2 resolution = vec2(640.0, 360.0);
        vec2 pos = gl_FragCoord.xy / resolution;
        vec4 color1 = texture2D(u_texture, pos);
        vec4 color2 = texture2D(u_texture2, pos);
        // color1.a = 0.5;
        color2.a = 0.5;
        // gl_FragColor = color2;
        gl_FragColor = vec4(color2.rgb * color2.a + color1.rgb * (1.0 - color2.a), 1.0 - (1.0 - color2.a) * (1.0 - color1.a));
    }
`



const canvas = document.createElement('canvas');
const width = 640;
const height = 360;
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl', {
    premultipliedAlpha: false
});
const f32size = Float32Array.BYTES_PER_ELEMENT;
const imageWrapper = document.createElement('div');
imageWrapper.style.position = 'relative';
imageWrapper.style.width = width + 'px';
imageWrapper.style.height = height + 'px';
document.body.appendChild(imageWrapper);

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

let points = new Float32Array([
    0.0, 0.0,
    width, 0.0,
    width, height,
    width, height,
    0.0, height,
    0.0, 0.0
]);

let buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
let texture1, texture2, texture3, texture4

let normalProgram = util.initWebGL(gl, vertexShader, fragmentShader);
let blendProgram = util.initWebGL(gl, vertexShader, fragmentShader2);

gl.useProgram(normalProgram);
let normalProgramParams = {
    a_position: gl.getAttribLocation(normalProgram, 'a_position'),
    u_projection: gl.getUniformLocation(normalProgram, 'u_projection'),
    u_texture: gl.getUniformLocation(normalProgram, 'u_texture')
}

let projectionMat = util.createProjection(width, height, 1);
gl.uniformMatrix4fv(normalProgramParams.u_projection, false, projectionMat);
gl.enableVertexAttribArray(normalProgramParams.a_position);
gl.vertexAttribPointer(normalProgramParams.a_position, 2, gl.FLOAT, false, f32size * 2, 0);


gl.useProgram(blendProgram);
let blendProgramParams = {
    a_position: gl.getAttribLocation(blendProgram, 'a_position'),
    u_projection: gl.getUniformLocation(blendProgram, 'u_projection'),
    u_texture: gl.getUniformLocation(blendProgram, 'u_texture'),
    u_texture2: gl.getUniformLocation(blendProgram, 'u_texture2'),
}
gl.uniformMatrix4fv(blendProgramParams.u_projection, false, projectionMat);
gl.enableVertexAttribArray(blendProgramParams.a_position);
gl.vertexAttribPointer(blendProgramParams.a_position, 2, gl.FLOAT, false, f32size * 2, 0);

gl.uniform1i(blendProgramParams.u_texture, 0);
gl.uniform1i(blendProgramParams.u_texture2, 1);

let textures = [];

let opacity = 0.5;

let image1 = new Image();
image1.width = width;
image1.height = height;
image1.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
`
image1.src = '../assets/gaoda1.jpg';
image1.onload = function () {
    texture1 = util.createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    textures.push({
        image: image1,
        texture: texture1
    });
    imageWrapper.appendChild(image1);
}



let image2 = new Image();
image2.width = width;
image2.height = height;
image2.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    opacity: ${opacity}
`
image2.src = '../assets/gaoda2.jpg';
image2.onload = function () {
    texture2 = util.createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    textures.push({
        image: image2,
        texture: texture2
    });
    imageWrapper.appendChild(image2);
}


let image3 = new Image();
image3.width = width;
image3.height = height;
image3.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    opacity: ${opacity}
`
image3.src = '../assets/gaoda3.jpg';
image3.onload = function () {
    texture3 = util.createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image3);
    textures.push({
        image: image3,
        texture: texture3
    });
    imageWrapper.appendChild(image3);
}

let image4 = new Image();
image4.src = '../assets/4ktest.jpeg';
image4.width = width;
image4.height = height;
image4.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    opacity: ${opacity}
`
image4.onload = function () {
    texture4 = util.createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image4);
    textures.push({
        image: image4,
        texture: texture4
    });
    imageWrapper.appendChild(image4);
}


function switchTexture(index) {
    gl.useProgram(normalProgram);
    switch (index) {
        case 1:
            gl.bindTexture(gl.TEXTURE_2D, texture1);
            break;
        case 2:
            gl.bindTexture(gl.TEXTURE_2D, texture2);
            break;
        case 3:
            gl.bindTexture(gl.TEXTURE_2D, texture3);
            break;
        default:
            break;
    }

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}
window.switchTexture = switchTexture;



let blendTextures = [];
let blendFramebuffers = [];
for (let i = 0; i < 2; i++) {
    let framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    let texture = util.createTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    blendTextures.push(texture);
    blendFramebuffers.push(framebuffer);
}
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
gl.bindTexture(gl.TEXTURE_2D, null);

function blendLayer(_textures = textures) {
    requestAnimationFrame(blendLayer);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!_textures.length) return;
    if (_textures.length === 1) {
        gl.useProgram(normalProgram);
    } else if (_textures.length === 2) {
        gl.useProgram(blendProgram);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, _textures[0].texture);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, _textures[1].texture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    } else if (_textures.length >= 3) {
        let texturesCopy = _textures.slice();
        gl.useProgram(blendProgram);
        let count = 0;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, _textures[0].texture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, _textures[1].texture);
        texturesCopy.shift();
        texturesCopy.shift();

        gl.bindFramebuffer(gl.FRAMEBUFFER, blendFramebuffers[count]);
        // gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, blendTextures[count]);
        count++;


        for (let i = 0; i < texturesCopy.length; i++) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, texturesCopy[i].texture);
            gl.bindFramebuffer(gl.FRAMEBUFFER, blendFramebuffers[count % 2]);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, blendTextures[count % 2]);
            count++;
        }
        gl.useProgram(normalProgram);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

    
    }
}
requestAnimationFrame(blendLayer)

window.blendLayer = blendLayer;
// blendLayer();