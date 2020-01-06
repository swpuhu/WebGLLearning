/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {string} type 
 * @param {string} source 
 */
function createShader (gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {WebGLShader} vertexShader 
 * @param {WebGLShader} fragmentShader 
 */
function createProgram (gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {string} vertexSource 
 * @param {string} fragmentSource 
 */
function initWebGL (gl, vertexSource, fragmentSource) {
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    let program = createProgram(gl, vertexShader, fragmentShader);
    return program;
}

function createProjection (width, height, depth) {
    return [
        2 / width, 0, 0, 0,
        0, 2 / height, 0, 0,
        0, 0, 2 / depth, 0,
        -1, -1, 0, 1,
    ];
}

/**
 *
 * @param {Object} center
 * @param {Number} rotate
 */
function createRotateMatrix (center, rotate, axis = 'z') {
    let cos = Math.cos(rotate * Math.PI / 180);
    let sin = Math.sin(rotate * Math.PI / 180);
    if (!center.z) {
        center.z = 0;
    }
    let ret;
    switch (axis) {
        case 'x':
            ret = new Float32Array([
                1.0, 0.0, 0.0, 0.0,
                0.0, cos, sin, 0.0,
                0.0, -sin, cos, 0.0,
                0.0, (1 - cos) * center.y + sin * center.z, (1 - cos) * center.z - sin * center.y, 1.0
            ]);
            break;
        case 'y':
            ret = new Float32Array([
                cos, 0.0, sin, 0.0,
                0.0, 1.0, 0.0, 0.0,
                -sin, 0.0, cos, 0.0,
                (1 - cos) * center.x + sin * center.z, 0.0, (1 - cos) * center.z - sin * center.x, 1.0
            ]);
            break;
        default:
            ret = new Float32Array([
                cos, sin, 0.0, 0.0,
                -sin, cos, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                (1 - cos) * center.x + sin * center.y, (1 - cos) * center.y - sin * center.x, 0.0, 1.0,
            ]);
    }
    return ret;
}

/**
 *
 * @param {Number} tx
 * @param {Number} ty
 */
function createTranslateMatrix (tx = 0, ty = 0, tz = 0) {
    return new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        tx, ty, tz, 1.0,
    ]);
}

/**
 *
 * @param {Number} scaleX
 * @param {Number} scaleY
 * @param {Number} scaleZ
 */
function createScaleMatrix (scaleX, scaleY, scaleZ, center = {
    x: 0,
    y: 0,
    z: 0
}) {
    return new Float32Array([
        scaleX, 0.0, 0.0, 0.0,
        0.0, scaleY, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        -scaleX * center.x + center.x, -scaleY * center.y + center.y, -scaleZ * center.z + center.z, 1.0,
    ]);
}

/**
 * @desc 对比度矩阵
 * @param {Number} value
 */
function createContrastMatrix (value) {
    return new Float32Array([
        value, 0.0, 0.0, 0.0,
        0.0, value, 0.0, 0.0,
        0.0, 0.0, value, 0.0,
        0.5 * (1 - value), 0.5 * (1 - value), 0.5 * (1 - value), 1.0,
    ]);
}


/**
 * @desc 色相旋转矩阵
 * @param {Number} value
 */
function createHueRotateMatrix (value) {
    let sin = Math.sin(value * Math.PI / 180);
    let cos = Math.cos(value * Math.PI / 180);
    return new Float32Array([
        0.213 + cos * 0.787 - sin * 0.213, 0.213 - cos * 0.213 + sin * 0.143, 0.213 - cos * 0.213 - sin * 0.787, 0.0,
        0.715 - cos * 0.715 - sin * 0.715, 0.715 + cos * 0.285 + sin * 0.140, 0.715 - cos * 0.715 + sin * 0.715, 0.0,
        0.072 - cos * 0.072 + sin * 0.928, 0.072 - cos * 0.072 - sin * 0.283, 0.072 + cos * 0.928 + sin * 0.072, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]);
}

/**
 * @desc 饱和度矩阵
 * @param {Number} value
 */
function createSaturateMatrix (value) {
    return new Float32Array([
        0.3086 * (1 - value) + value, 0.3086 * (1 - value), 0.3086 * (1 - value), 0.0,
        0.6094 * (1 - value), 0.6094 * (1 - value) + value, 0.6094 * (1 - value), 0.0,
        0.0820 * (1 - value), 0.0820 * (1 - value), 0.0820 * (1 - value) + value, 0.0,
        0.0, 0.0, 0.0, 1.0
    ]);
}

/**
 * @param {WebGLRenderingContext} gl
 * @param {Number} x 中心x坐标
 * @param {Number} y 中心y坐标
 * @param {radius} radius 圆弧半径
 * @param {Number} startArc 起始圆弧半径
 * @param {Number} endArc 终止圆弧半径
 * @param {Boolean} clockwise 方向，默认顺时针
 */
function createArcVertex (gl, x, y, radius, startArc, endArc, isInverse = false) {
    let precision = 1;
    let oneArc = Math.PI / 180
    let points = [x, y, x / gl.canvas.width, y / gl.canvas.height];
    for (let i = startArc; i <= endArc; i += precision) {
        if (!isInverse) {
            points.push(
                x + radius * Math.sin(i * oneArc),
                (y - radius * Math.cos(i * oneArc)),
                (x + radius * Math.sin(i * oneArc)) / gl.canvas.width,
                (y - radius * Math.cos(i * oneArc)) / gl.canvas.height);
        } else {
            points.push(
                x - radius * Math.sin(i * oneArc),
                (y - radius * Math.cos(i * oneArc)),
                (x - radius * Math.sin(i * oneArc)) / gl.canvas.width,
                (y - radius * Math.cos(i * oneArc)) / gl.canvas.height);
        }

    }
    return new Float32Array(points);
}

/**
 *
 * @param {WebGLRenderingContext} gl
 */
function createTexture (gl) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

function computeKernalWeight (kernal) {
    let weight = kernal.reduce((prev, cur) => {
        return prev + cur;
    }, 0);
    return weight <= 0 ? 1 : weight;
}

/**
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Array} vertX
 * @param {Array} vertY
 */
function checkPointIn (x, y, vertX, vertY) {
    let minX = Math.min(...vertX);
    let minY = Math.min(...vertY);
    let maxX = Math.max(...vertX);
    let maxY = Math.max(...vertY);
    if (x < minX || x > maxX || y < minY || y > maxY) {
        return false;
    } else {
        let i, j, r;
        r = false;
        for (let i = 0, j = vertX.length - 1; i < vertX.length; j = i++) {
            if ((vertY[i] > y) !== (vertY[j] > y) &&
                (x < (y - vertY[i]) * (vertX[j] - vertX[i]) / (vertY[j] - vertY[i]) + vertX[i])) {
                r = !r;
            }
        }
        return r;
    }
}

/**
 *
 * @param {Number} x
 * @param {Number} y
 * @param {Array} vertX
 * @param {Array} vertY
 */
function checkPointIn2 (x, y, vertX, vertY) {
    let minX = Math.min(...vertX);
    let minY = Math.min(...vertY);
    let maxX = Math.max(...vertX);
    let maxY = Math.max(...vertY);
    if (x < minX || x > maxX || y < minY || y > maxY) {
        return false;
    } else {
        let i, j, r;
        r = false;
        for (let i = 0, j = vertX.length - 1; i < vertX.length; j = i++) {
            if ((vertY[i] > y) !== (vertY[j] > y) &&
                (x < (y - vertY[i]) * (vertX[j] - vertX[i]) / (vertY[j] - vertY[i]) + vertX[i])) {
                r = !r;
            }
        }
        return r;
    }

}

/**
 *
 * @param {String} hex
 */
function hexToRGB (hex) {
    if (/#[a-f0-9]{6}/i.test(hex)) {
        let r = +('0x' + hex.substr(1, 2));
        let g = +('0x' + hex.substr(3, 2));
        let b = +('0x' + hex.substr(5, 2));
        return [r / 255, g / 255, b / 255];
    }
}

function generateImageByDiv (width, height, html) {
    let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);

    let style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
        @font-face {
            font-family: 'ShouJinTi';
            src: url('http://localhost:8081/WebGLTraining/assets/shoujin.ttf');
        }
    `;

    let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('x', 0);
    foreignObject.setAttribute('y', 0);
    foreignObject.setAttribute('width', width);
    foreignObject.setAttribute('height', height);

    let div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    div.innerHTML = html;
    foreignObject.appendChild(div);
    svg.appendChild(style);
    svg.appendChild(foreignObject);
    return svg;
}

/**
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {number} left 
 * @param {number} right 
 * @param {number} _bottom 
 * @param {number} _top 
 */
function createClipPath (canvas, left = 0, right = 0, _bottom = 0, _top = 0, offsetX = 0, offsetY = 0, scaleX = 1, scaleY = 1, rotate = 0) {
    return new Float32Array([
        0 + canvas.width * left, 0 + canvas.height * _top, left, _top,
        canvas.width - canvas.width * right, 0 + canvas.height * _top, 1 - right, _top,
        canvas.width - canvas.width * right, canvas.height - canvas.height * _bottom, 1 - right, 1 - _bottom,
        canvas.width - canvas.width * right, canvas.height - canvas.height * _bottom, 1 - right, 1 - _bottom,
        0 + canvas.width * left, canvas.height - canvas.height * _bottom, left, 1 - _bottom,
        0 + canvas.width * left, 0 + canvas.height * _top, left, _top,
    ])
}

function rotate (center, x, y, rotate) {
    let cos = Math.cos(rotate * Math.PI / 180);
    let sin = Math.sin(rotate * Math.PI / 180);
    return [
        x * cos - y * sin + (1 - cos) * center.x + sin * center.y,
        x * sin + y * cos + (1 - cos) * center.y - sin * center.x,
    ]
}

function pnpoly (number, verX, verY, testX, testY) {
    let i, j, c = false;
    for (i = 0, j = number - 1; i < number; j = i++) {
        if (((verY[i] > testY) !== (verY[j] > testY)) &&
            (testX < (verX[j] - verX[i]) * (testY - verY[i]) / (verY[j] - verY[i]) + verX[i])) {
            c = !c;
        }
    }
    return c;
}

function calcDistance (x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

function createTriangleClipPath (canvas, progress, offsetX = 0, offsetY = 0, scaleX = 1, scaleY = 1, rotate = 0) {
    let centerX = canvas.width / 2 + offsetX * canvas.width;
    let centerY = canvas.height / 2 + offsetY * canvas.height;
    let distanceLD = calcDistance(centerX, centerY, 0, 0);
    let distanceLU = calcDistance(centerX, centerY, 0, canvas.height);
    let distanceRD = calcDistance(centerX, centerY, canvas.width, 0);
    let distanceRU = calcDistance(centerX, centerY, canvas.width, canvas.height);
    let r = Math.max(distanceLD, distanceLU, distanceRD, distanceRU) * progress;
    let points = new Float32Array([
        canvas.width / 2, canvas.height / 2 + 2 * r, 0.5, 0.5 + 2 * r / canvas.height,
        canvas.width / 2 - 1.732 * r, canvas.height / 2 - r, 0.5 - 1.732 * r / canvas.width, 0.5 - r / canvas.height,
        canvas.width / 2 + 1.732 * r, canvas.height / 2 - r, 0.5 + 1.732 * r / canvas.width, 0.5 - r / canvas.height
    ]);
    for (let i = 0; i < points.length; i += 4) {
        // points[i + 2] 
        points[i + 1] = canvas.height - points[i + 1];
        points[i + 3] = 1 - points[i + 3];
    }
    return points;
}



function createNoiseImage (width, height, type, factor) {
    let data;
    switch (type) {
        case WebGLRenderingContext.RGBA:
            data = new Uint8Array(width * height * 4);
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 2 * factor * Math.random();
                data[i + 1] = factor * Math.random();
                data[i + 2] = factor * Math.random();
                data[i + 3] = factor * Math.random();
            }
            break;
        case WebGLRenderingContext.RGB:
            data = new Uint8Array(width * height * 3);
            for (let i = 0; i < data.length; i += 3) {
                data[i] = factor * Math.random();
                data[i + 1] = factor * Math.random();
                data[i + 2] = factor * Math.random();
            }
            break;
        case WebGLRenderingContext.LUMINANCE_ALPHA:
            data = new Uint8Array(width * height * 2);
            for (let i = 0; i < data.length; i += 2) {
                data[i] = factor * Math.random();
                data[i + 1] = factor * Math.random();
            }
            break;
        case WebGLRenderingContext.LUMINANCE:
            data = new Uint8Array(width * height * 1);
            for (let i = 0; i < data.length; i++) {
                data[i] = factor * Math.random();
            }
            break;
    }
    return data;
}



function createPerspective (near, far, l, r, t, b) {
    let rangeInv = 1.0 / (far - near);

    let n = near;
    return [
        2 * n / (r - l), 0, 0, 0,
        0, 2 * n / (t - b), 0, 0,
        -(r + l) / (r - l), -(t + b) / (t - b), (near + far) * rangeInv, 1,
        0, 0, -near * far * rangeInv * 2, 0
    ];
}

function createEditor (name, type = 'range', min, max, value, step = 1) {
    let obj = {};
    let oninput = null;
    let wrapper = document.createElement('div');
    let label = document.createElement('label');
    label.innerText = name;
    let input = document.createElement('input');
    input.type = type;
    input.max = max;
    input.min = min;
    input.step = step;
    input.value = value;
    let display = document.createElement('label');
    display.textContent = value;

    input.oninput = function (e) {
        oninput && oninput.call(this, e);
        display.textContent = input.value;
    }

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(display);
    Object.defineProperties(obj, {
        oninput: {
            set (value) {
                oninput = value;
            },
            get () {
                return oninput;
            }
        },
        ref: {
            get () {
                return wrapper;
            }
        },
        step: {
            set (value) {
                input.step = value;
            }
        },
        value: {
            get () {
                return input.value;
            }
        }
    })
    return obj;
}

function MatMultiVec (v, m) {
    var dst = [];
    for (var i = 0; i < 4; ++i) {
        dst[i] = 0.0;
        for (var j = 0; j < 4; ++j) {
            dst[i] += v[j] * m[j * 4 + i];
        }
    }
    return dst;
}


function multiply (a, b) {
    var a00 = a[0 * 4 + 0];
    var a01 = a[0 * 4 + 1];
    var a02 = a[0 * 4 + 2];
    var a03 = a[0 * 4 + 3];
    var a10 = a[1 * 4 + 0];
    var a11 = a[1 * 4 + 1];
    var a12 = a[1 * 4 + 2];
    var a13 = a[1 * 4 + 3];
    var a20 = a[2 * 4 + 0];
    var a21 = a[2 * 4 + 1];
    var a22 = a[2 * 4 + 2];
    var a23 = a[2 * 4 + 3];
    var a30 = a[3 * 4 + 0];
    var a31 = a[3 * 4 + 1];
    var a32 = a[3 * 4 + 2];
    var a33 = a[3 * 4 + 3];
    var b00 = b[0 * 4 + 0];
    var b01 = b[0 * 4 + 1];
    var b02 = b[0 * 4 + 2];
    var b03 = b[0 * 4 + 3];
    var b10 = b[1 * 4 + 0];
    var b11 = b[1 * 4 + 1];
    var b12 = b[1 * 4 + 2];
    var b13 = b[1 * 4 + 3];
    var b20 = b[2 * 4 + 0];
    var b21 = b[2 * 4 + 1];
    var b22 = b[2 * 4 + 2];
    var b23 = b[2 * 4 + 3];
    var b30 = b[3 * 4 + 0];
    var b31 = b[3 * 4 + 1];
    var b32 = b[3 * 4 + 2];
    var b33 = b[3 * 4 + 3];
    return [
        b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
        b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
        b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
        b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
        b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
        b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
        b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
        b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
        b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
        b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
        b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
        b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
        b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
        b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
        b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
        b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    ];
};

function inverse (m) {
    var m00 = m[0 * 4 + 0];
    var m01 = m[0 * 4 + 1];
    var m02 = m[0 * 4 + 2];
    var m03 = m[0 * 4 + 3];
    var m10 = m[1 * 4 + 0];
    var m11 = m[1 * 4 + 1];
    var m12 = m[1 * 4 + 2];
    var m13 = m[1 * 4 + 3];
    var m20 = m[2 * 4 + 0];
    var m21 = m[2 * 4 + 1];
    var m22 = m[2 * 4 + 2];
    var m23 = m[2 * 4 + 3];
    var m30 = m[3 * 4 + 0];
    var m31 = m[3 * 4 + 1];
    var m32 = m[3 * 4 + 2];
    var m33 = m[3 * 4 + 3];
    var tmp_0 = m22 * m33;
    var tmp_1 = m32 * m23;
    var tmp_2 = m12 * m33;
    var tmp_3 = m32 * m13;
    var tmp_4 = m12 * m23;
    var tmp_5 = m22 * m13;
    var tmp_6 = m02 * m33;
    var tmp_7 = m32 * m03;
    var tmp_8 = m02 * m23;
    var tmp_9 = m22 * m03;
    var tmp_10 = m02 * m13;
    var tmp_11 = m12 * m03;
    var tmp_12 = m20 * m31;
    var tmp_13 = m30 * m21;
    var tmp_14 = m10 * m31;
    var tmp_15 = m30 * m11;
    var tmp_16 = m10 * m21;
    var tmp_17 = m20 * m11;
    var tmp_18 = m00 * m31;
    var tmp_19 = m30 * m01;
    var tmp_20 = m00 * m21;
    var tmp_21 = m20 * m01;
    var tmp_22 = m00 * m11;
    var tmp_23 = m10 * m01;

    var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
        (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
    var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
        (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
    var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
        (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
    var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
        (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

    var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    return [
        d * t0,
        d * t1,
        d * t2,
        d * t3,
        d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
        d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
        d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
        d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
        d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
        d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
        d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
        d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
        d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
        d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
        d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
        d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
    ];
};


function cross (a, b) {
    return [a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
    ];
};

function subtractVectors (a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}


function normalize (v) {
    var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    // 确定不会除以 0
    if (length > 0.00001) {
        return [v[0] / length, v[1] / length, v[2] / length];
    } else {
        return [0, 0, 0];
    }
}

function lookAt (cameraPosition, target, up) {
    var zAxis = normalize(
        subtractVectors(target, cameraPosition));
    var xAxis = normalize(cross(up, zAxis));
    var yAxis = normalize(cross(zAxis, xAxis));

    return [
        xAxis[0], xAxis[1], xAxis[2], 0,
        yAxis[0], yAxis[1], yAxis[2], 0,
        zAxis[0], zAxis[1], zAxis[2], 0,
        cameraPosition[0],
        cameraPosition[1],
        cameraPosition[2],
        1,
    ];
}

function createCirclePoints (centerX, centerY, radius, precision = 1) {
    let step = Math.floor(360 / precision);
    let arr = [];
    arr.push(centerX, centerY);
    for (let i = 0; i < 360; i += precision) {
        let cos = centerX + radius * Math.cos(i * Math.PI / 180);
        let sin = centerY + radius * Math.sin(i * Math.PI / 180);
        arr.push(cos, sin);
    }
    arr.push(centerX + radius * Math.cos(360 * Math.PI / 180), centerY + radius * Math.sin(360 * Math.PI / 180));
    arr = new Float32Array(arr);
    return [WebGL2RenderingContext.TRIANGLE_FAN, arr];
}


function createRectPoints (x, y, width, height) {
    let arr = new Float32Array([
        x, y,
        x + width, y,
        x + width, y + height,
        x + width, y + height,
        x, y + height,
        x, y
    ]);
    return [WebGL2RenderingContext.TRIANGLES, arr];
}




function generateTriangles (points1, points2) {
    let ret = [];
    for (let i = 0; i < points1.length - 2; i += 2) {
        let point1X = points1[i];
        let point2X = points2[i];
        let point1Y = points1[i + 1];
        let point2Y = points2[i + 1];
        let nextPoint1X = points1[i + 2];
        let nextPoint2X = points2[i + 2];
        let nextPoint1Y = points1[i + 3];
        let nextPoint2Y = points2[i + 3];
        ret.push(
            point2X, point2Y,
            point1X, point1Y,
            nextPoint1X, nextPoint1Y,
            nextPoint1X, nextPoint1Y,
            nextPoint2X, nextPoint2Y,
            point2X, point2Y
        );
    }
    return new Float32Array(ret);
}


function generateTrianglesByLines (lines) {
    if (lines.length < 2) throw new Error('lines nums must be more than 1');
    let _lines = [...lines];
    let ret = [];
    let baseLine = _lines.shift();
    while (_lines.length) {
        let line = _lines.shift();
        let points1 = baseLine;
        let points2 = line;
        for (let i = 0; i < points1.length - 4; i += 4) {
            let point1X = points1[i];
            let point2X = points2[i];
            let point1Y = points1[i + 1];
            let point2Y = points2[i + 1];
            let point1Z = points1[i + 2];
            let point2Z = points2[i + 2];
            let nextPoint1X = points1[i + 4];
            let nextPoint2X = points2[i + 4];
            let nextPoint1Y = points1[i + 5];
            let nextPoint2Y = points2[i + 5];
            let nextPoint1Z = points1[i + 6];
            let nextPoint2Z = points2[i + 6];
            ret.push(
                point2X, point2Y, point2Z, 1,
                point1X, point1Y, point1Z, 1,
                nextPoint1X, nextPoint1Y, nextPoint1Z, 1,
                nextPoint1X, nextPoint1Y, nextPoint1Z, 1,
                nextPoint2X, nextPoint2Y, nextPoint2Z, 1,
                point2X, point2Y, point2Z, 1
            );
        }
        baseLine = line;
    }

    return ret;
}


function createUniformSetters (gl, program) {
    let textureUnit = 0;

    /**
     * Creates a setter for a uniform of the given program with it's
     * location embedded in the setter.
     * @param {WebGLProgram} program
     * @param {WebGLUniformInfo} uniformInfo
     * @returns {function} the created setter.
     */
    function createUniformSetter (program, uniformInfo) {
        const location = gl.getUniformLocation(program, uniformInfo.name);
        const type = uniformInfo.type;
        // Check if this uniform is an array
        const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');
        if (type === gl.FLOAT && isArray) {
            return function (v) {
                gl.uniform1fv(location, v);
            };
        }
        if (type === gl.FLOAT) {
            return function (v) {
                gl.uniform1f(location, v);
            };
        }
        if (type === gl.FLOAT_VEC2) {
            return function (v) {
                gl.uniform2fv(location, v);
            };
        }
        if (type === gl.FLOAT_VEC3) {
            return function (v) {
                gl.uniform3fv(location, v);
            };
        }
        if (type === gl.FLOAT_VEC4) {
            return function (v) {
                gl.uniform4fv(location, v);
            };
        }
        if (type === gl.INT && isArray) {
            return function (v) {
                gl.uniform1iv(location, v);
            };
        }
        if (type === gl.INT) {
            return function (v) {
                gl.uniform1i(location, v);
            };
        }
        if (type === gl.INT_VEC2) {
            return function (v) {
                gl.uniform2iv(location, v);
            };
        }
        if (type === gl.INT_VEC3) {
            return function (v) {
                gl.uniform3iv(location, v);
            };
        }
        if (type === gl.INT_VEC4) {
            return function (v) {
                gl.uniform4iv(location, v);
            };
        }
        if (type === gl.BOOL) {
            return function (v) {
                gl.uniform1iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC2) {
            return function (v) {
                gl.uniform2iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC3) {
            return function (v) {
                gl.uniform3iv(location, v);
            };
        }
        if (type === gl.BOOL_VEC4) {
            return function (v) {
                gl.uniform4iv(location, v);
            };
        }
        if (type === gl.FLOAT_MAT2) {
            return function (v) {
                gl.uniformMatrix2fv(location, false, v);
            };
        }
        if (type === gl.FLOAT_MAT3) {
            return function (v) {
                gl.uniformMatrix3fv(location, false, v);
            };
        }
        if (type === gl.FLOAT_MAT4) {
            return function (v) {
                gl.uniformMatrix4fv(location, false, v);
            };
        }
        if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
            const units = [];
            for (let ii = 0; ii < info.size; ++ii) {
                units.push(textureUnit++);
            }
            return function (bindPoint, units) {
                return function (textures) {
                    gl.uniform1iv(location, units);
                    textures.forEach(function (texture, index) {
                        gl.activeTexture(gl.TEXTURE0 + units[index]);
                        gl.bindTexture(bindPoint, texture);
                    });
                };
            }(getBindPointForSamplerType(gl, type), units);
        }
        if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
            return function (bindPoint, unit) {
                return function (texture) {
                    gl.uniform1i(location, unit);
                    gl.activeTexture(gl.TEXTURE0 + unit);
                    gl.bindTexture(bindPoint, texture);
                };
            }(getBindPointForSamplerType(gl, type), textureUnit++);
        }
        throw ('unknown type: 0x' + type.toString(16)); // we should never get here.
    }

    const uniformSetters = {};
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let ii = 0; ii < numUniforms; ++ii) {
        const uniformInfo = gl.getActiveUniform(program, ii);
        if (!uniformInfo) {
            break;
        }
        let name = uniformInfo.name;
        // remove the array suffix.
        if (name.substr(-3) === '[0]') {
            name = name.substr(0, name.length - 3);
        }
        const setter = createUniformSetter(program, uniformInfo);
        uniformSetters[name] = setter;
    }
    return uniformSetters;
}


function createAttributeSetters (gl, program) {
    const attribSetters = {
    };

    function createAttribSetter (index) {
        return function (b) {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
            gl.enableVertexAttribArray(index);
            gl.vertexAttribPointer(
                index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
        };
    }

    const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let ii = 0; ii < numAttribs; ++ii) {
        const attribInfo = gl.getActiveAttrib(program, ii);
        if (!attribInfo) {
            break;
        }
        const index = gl.getAttribLocation(program, attribInfo.name);
        attribSetters[attribInfo.name] = createAttribSetter(index);
    }

    return attribSetters;
}


function setUniforms (setters, values) {
    setters = setters.uniformSetters || setters;
    Object.keys(values).forEach(function (name) {
        const setter = setters[name];
        if (setter) {
            setter(values[name]);
        }
    });
}

function setAttributes (setters, attribs) {
    setters = setters.attribSetters || setters;
    Object.keys(attribs).forEach(function (name) {
        const setter = setters[name];
        if (setter) {
            setter(attribs[name]);
        }
    });
}

export default {
    initWebGL,
    createProjection,
    createTranslateMatrix,
    createRotateMatrix,
    createScaleMatrix,
    createContrastMatrix,
    createHueRotateMatrix,
    createSaturateMatrix,
    createArcVertex,
    createTexture,
    createClipPath,
    createTriangleClipPath,
    createNoiseImage,
    createPerspective,
    rotate,
    pnpoly,
    createEditor,
    inverse,
    MatMultiVec,
    multiply,
    cross,
    subtractVectors,
    lookAt,
    createCirclePoints,
    createRectPoints,
    generateTriangles,
    createUniformSetters,
    createAttributeSetters,
    setUniforms,
    setAttributes,
    generateTrianglesByLines
}