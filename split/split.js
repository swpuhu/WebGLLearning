import util from '../util.js';

const vertexShader = `
    attribute vec4 a_position;
    uniform mat4 u_projection;
    void main () {
        gl_Position = u_projection * a_position;
    }
`

const fragShader = `
    precision mediump float;
    uniform vec3 line1;
    uniform vec3 line2;
    uniform vec3 line3;
    uniform vec3 line4;
    uniform vec2 vector1;
    uniform vec2 vector2;
    uniform vec2 vector3;
    uniform vec2 vector4;
    uniform mat4 u_rotate;
    
    uniform sampler2D texture;
    float getDistance(vec3 line, vec2 p) {
        return (line.x * p.x + line.y * p.y + line.z) / (sqrt(pow(p.x, 2.0) + pow(p.y, 2.0) ));
    }
    int isLeftOrRight(vec3 line, vec2 p) {
        return getDistance(line, p) >= 0.0 ? 1 : 0;
    }
    void main () {
        vec2 p = gl_FragCoord.xy;
        int isRightL1 = isLeftOrRight(line1, p);
        int isRightL2 = isLeftOrRight(line2, p);
        int isRightL3 = isLeftOrRight(line3, p);
        int isRightL4 = isLeftOrRight(line4, p);
        int type = 2;
        p = gl_FragCoord.xy;

        if (type == 1) {
            if (isRightL1 != 1) {
                p -= vector1;
            } else if (isRightL2 == 1) {
                p -= vector2;
            }
            
            if (isRightL1 != 1 || isRightL2 == 1) {
                if (p.x < 0. || p.y > 360. || p.x > 640. || p.y < 0.) {
                    return;
                }
                vec4 textureColor = texture2D(texture, p / vec2(640., 360.));   
                gl_FragColor = textureColor;
            }
        } else {
            if (isRightL1 != 1 && isRightL3 != 1) {
                p -= 
            }
        }
    }
`
let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
let width = 640;
let height = 360;
canvas.width = width;
canvas.height = height;
let gl = canvas.getContext('webgl');
let program = util.initWebGL(gl, vertexShader, fragShader);
gl.useProgram(program);
let points = new Float32Array([
    0.0, 0.0,
    width, 0.0,
    width, height,
    width, height,
    0.0, height,
    0.0, 0.0
]);

let pointsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);

let attribSetters = util.createAttributeSetters(gl, program);
let uniformSetters = util.createUniformSetters(gl, program);




// 以上程序通用

class Line {
    constructor (a, b, c) {
        if (a < 0) {
            this.a = -a;
            this.b = -b;
            this.c = -c;
        } else {
            this.a = a;
            this.b = b;
            this.c = c;
        }
    }

    transform (tx, ty) {
        // this.c = -this.a * tx - this.b * ty + this.c;
        return new Line(this.a, this.b, -this.a * tx - this.b * ty + this.c);
    }

    rotate(angle, rx, ry) {
        let a = this.a;
        let b = this.b;
        let cos = Math.cos(angle * Math.PI / 180);
        let sin = Math.sin(angle * Math.PI / 180);
        // this.a = a * cos - b * sin;
        // this.b = a * sin + b * cos;
        // this.c = (a + b * sin - a * cos) * rx + (b - a * sin - b * cos) * ry + this.c;
        return new Line(a * cos - b * sin, a * sin + b * cos, (a + b * sin - a * cos) * rx + (b - a * sin - b * cos) * ry + this.c);
    }

    getDistance(x, y) {
        return Math.abs((this.a * x + this.b * y + this.c) / (Math.sqrt(this.a ** 2 + this.b ** 2)));
    }

    getNormalDistance(length) {
        let v = [this.b, this.a];
        let vLength = Math.sqrt(this.b ** 2 + this.a ** 2);
        let k = 1;
        if (length) {
            k = length / vLength;
        }
        return [this.b * k, this.a * k];
    }
}
class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    multiplyScalar(s) {
        return new Vec2(this.x * s, this.y * s);
    }

    // 逆时针旋转为正方向
    rotate(angle) {
        let sin = Math.sin(angle * Math.PI / 180);
        let cos = Math.cos(angle * Math.PI / 180);
        return new Vec2(this.x * cos - this.y * sin, this.y * cos + this.x * sin);
    }

    scale(length = 0) {
        let k = length / Math.sqrt(this.x ** 2 + this.y ** 2);
        return new Vec2(k * this.x, k * this.y);
    }
}

window.Line = Line;

let attributes = {
    a_position: {
        numComponents: 2, 
        stride: Float32Array.BYTES_PER_ELEMENT * 2,
        offset: 0,
        buffer: pointsBuffer
    }
}

let rotate = 45;

let uniforms = {
    u_projection: util.createProjection(width, height, 0.5),
    u_rotate: util.createRotateMatrix({x: width / 2, y: height / 2}, 45, 'z')
}

let horizotalLine = new Line(0, 1, -height / 2);
let verticalLine = new Line(1, 0, -width / 2);
let progress = 0.3;
let baseLine = horizotalLine.rotate(rotate, width / 2, height / 2);
let baseLineVertical = verticalLine.rotate(rotate, width / 2, height / 2);
let distance = Math.max(
    baseLine.getDistance(0, height),
    baseLine.getDistance(width, height),
    baseLine.getDistance(0, 0),
    baseLine.getDistance(width, 0)
) * progress;
let vector1 = new Vec2(0, 1).rotate(rotate).scale(distance);
let vector2 = new Vec2(0, -1).rotate(rotate).scale(distance);
let vector3 = new Vec2(-1, 0).rotate(-rotate).scale(distance);
let vector4 = new Vec2(1, 1).rotate(-rotate).scale(distance);

let line1 = baseLine.transform(vector1.x, vector1.y);
let line2 = baseLine.transform(vector2.x, vector2.y);
let line3 = baseLine.transform(vector3.x, vector3.y);
let line4 = baseLine.transform(vector4.x, vector4.y);

uniforms.line1 = new Float32Array([line1.a, line1.b, line1.c]);
uniforms.line2 = new Float32Array([line2.a, line2.b, line2.c]);
uniforms.line2 = new Float32Array([line3.a, line3.b, line3.c]);
uniforms.line2 = new Float32Array([line4.a, line4.b, line4.c]);
uniforms.vector1 = new Float32Array([vector1.x, vector1.y]);
uniforms.vector2 = new Float32Array([vector2.x, vector2.y]);
uniforms.vector3 = new Float32Array([vector3.x, vector3.y]);
uniforms.vector4 = new Float32Array([vector4.x, vector4.y]);

let texture = util.createTexture(gl);

let image = new Image();
image.src = '../assets/gaoda1.jpg';
image.onload = function () {
    util.setAttributes(attribSetters, attributes);
    util.setUniforms(uniformSetters, uniforms);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

}



function reDraw() {
    baseLine = horizotalLine.rotate(rotate, width / 2, height / 2);
    distance = Math.max(
        baseLine.getDistance(0, height),
        baseLine.getDistance(width, height),
        baseLine.getDistance(0, 0),
        baseLine.getDistance(width, 0)
    ) * progress;
    console.log("distance: " ,distance);
    
    vector1 = new Vec2(0, 1).rotate(rotate).scale(distance);
    vector2 = new Vec2(0, -1).rotate(rotate).scale(distance);
    vector3 = new Vec2(-1, 0).rotate(-rotate).scale(distance);
    vector4 = new Vec2(1, 1).rotate(-rotate).scale(distance);
    if (rotate < 0 || rotate > 180) {
        [vector1, vector2] = [vector2, vector1];    
    }
    // if (baseLine.x >= 0 && baseLine.y >) {
    
    // }
    
    line1 = baseLine.transform(vector1.x, vector1.y);
    line2 = baseLine.transform(vector2.x, vector2.y);
    line3 = baseLine.transform(vector3.x, vector3.y);
    line4 = baseLine.transform(vector4.x, vector4.y);
    uniforms.line1 = new Float32Array([line1.a, line1.b, line1.c]);
    uniforms.line2 = new Float32Array([line2.a, line2.b, line2.c]);
    uniforms.line2 = new Float32Array([line3.a, line3.b, line3.c]);
    uniforms.line2 = new Float32Array([line4.a, line4.b, line4.c]);
    uniforms.vector1 = new Float32Array([vector1.x, vector1.y]);
    uniforms.vector2 = new Float32Array([vector2.x, vector2.y]);
    uniforms.vector3 = new Float32Array([vector3.x, vector3.y]);
    uniforms.vector4 = new Float32Array([vector4.x, vector4.y]);
    util.setAttributes(attribSetters, attributes);
    util.setUniforms(uniformSetters, uniforms);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    console.log(progress);
    

}
document.onkeydown = function (e) {
    if (e.key === 'ArrowUp') {
        progress += 0.01;
        reDraw();
    } else if (e.key === 'ArrowDown') {
        progress -= 0.01;
        reDraw();
    } else if (e.key === 'ArrowLeft') {
        rotate -= 1;
        reDraw();
    } else if (e.key === 'ArrowRight') {
        rotate += 1;
        reDraw();
    }
}