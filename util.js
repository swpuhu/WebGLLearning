/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {string} type 
 * @param {string} source 
 */
function createShader(gl, type, source) {
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
function createProgram(gl, vertexShader, fragmentShader) {
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
function initWebGL(gl, vertexSource, fragmentSource) {
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    let program = createProgram(gl, vertexShader, fragmentShader);
    return program;
}

function createProjection(width, height, depth) {
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
function createRotateMatrix(center, rotate, axis = 'z') {
    let cos = Math.cos(rotate * Math.PI / 180);
    let sin = Math.sin(rotate * Math.PI / 180);
    if (!center.z) {
        center.z = 0;
    }
    let ret;
    switch(axis) {
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
function createTranslateMatrix(tx, ty) {
    return new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        tx, ty, 0.0, 1.0,
    ]);
}

/**
 *
 * @param {Number} scaleX
 * @param {Number} scaleY
 */
function createScaleMatrix(scaleX, scaleY, center = {
    x: 0,
    y: 0
}) {
    return new Float32Array([
        scaleX, 0.0, 0.0, 0.0,
        0.0, scaleY, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        -scaleX * center.x + center.x, -scaleY * center.y + center.y, 0.0, 1.0,
    ]);
}

/**
 * @desc 对比度矩阵
 * @param {Number} value
 */
function createContrastMatrix(value) {
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
function createHueRotateMatrix(value) {
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
function createSaturateMatrix(value) {
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
function createArcVertex(gl, x, y, radius, startArc, endArc, isInverse = false) {
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
function createTexture(gl) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.generateMipmap(gl.TEXTURE_2D);
    return texture;
}

function computeKernalWeight(kernal) {
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
function checkPointIn(x, y, vertX, vertY) {
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
function checkPointIn2(x, y, vertX, vertY) {
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
function hexToRGB(hex) {
    if (/#[a-f0-9]{6}/i.test(hex)) {
        let r = +('0x' + hex.substr(1, 2));
        let g = +('0x' + hex.substr(3, 2));
        let b = +('0x' + hex.substr(5, 2));
        return [r / 255, g / 255, b / 255];
    }
}

function generateImageByDiv(width, height, html) {
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
function createClipPath(canvas, left = 0, right = 0, _bottom = 0, _top = 0, offsetX = 0, offsetY = 0, scaleX = 1, scaleY = 1, rotate = 0) {
    return new Float32Array([
        0 + canvas.width * left, 0 + canvas.height * _top, left, _top,
        canvas.width - canvas.width * right, 0 + canvas.height * _top, 1 - right, _top,
        canvas.width - canvas.width * right, canvas.height - canvas.height * _bottom, 1 - right, 1 - _bottom,
        canvas.width - canvas.width * right, canvas.height - canvas.height * _bottom, 1 - right, 1 - _bottom,
        0 + canvas.width * left, canvas.height - canvas.height * _bottom, left, 1 - _bottom,
        0 + canvas.width * left, 0 + canvas.height * _top, left, _top,
    ])
}

function rotate(center, x, y, rotate) {
    let cos = Math.cos(rotate * Math.PI / 180);
    let sin = Math.sin(rotate * Math.PI / 180);
    return [
        x * cos - y * sin + (1 - cos) * center.x + sin * center.y,
        x * sin + y * cos + (1 - cos) * center.y - sin * center.x,
    ]
}

function pnpoly(number, verX, verY, testX, testY) {
    let i, j, c = false;
    for(i = 0, j = number - 1; i < number; j = i++) {
        if(((verY[i] > testY) !== (verY[j] > testY)) &&
            (testX < (verX[j] - verX[i]) * (testY - verY[i]) / (verY[j] - verY[i]) + verX[i])) {
            c = !c;
        }
    }
    return c;
}

function calcDistance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
}

function createTriangleClipPath(canvas, progress, offsetX = 0, offsetY = 0, scaleX = 1, scaleY = 1, rotate = 0) {
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
         canvas.width / 2 + 1.732 * r, canvas.height / 2- r, 0.5 + 1.732 * r / canvas.width, 0.5 - r / canvas.height
    ]);
    for (let i = 0; i < points.length; i += 4) {
        // points[i + 2] 
        points[i + 1] = canvas.height - points[i + 1];
        points[i + 3] = 1 - points[i + 3];
    }
    return points;
}



function createNoiseImage(width, height, type, factor) {
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
    rotate,
    pnpoly,
}