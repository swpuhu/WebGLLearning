const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width =  512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

const canvas2 = document.createElement('canvas');
document.body.appendChild(canvas2);
canvas.width =  512;
canvas.height = 512;
const ctx2 = canvas.getContext('2d');

const input = document.createElement('input');
input.type = 'file';
document.body.appendChild(input);
input.onchange = function () {
    let fileReader = new FileReader();
    fileReader.readAsText(this.files[0]);
    let name = this.files[0].name.replace(/\.*$/, '.jpeg');
    fileReader.onload = function () {
        let [size, result] = analyzeLutFile(this.result);
        let mapV = mapValue(0, 255, 0, size - 1);
        let imageData = new ImageData(512, 512);
        for (let i = 0; i < data.length; i += 4) {
            let r = mapV(data[i]);
            let g = mapV(data[i + 1]);
            let b = mapV(data[i + 2]);
            let index = r + g * size + b * size * size;
            imageData.data[i] = result[index][0] * 255;
            imageData.data[i + 1] = result[index][1] * 255;
            imageData.data[i + 2] = result[index][2] * 255;
            imageData.data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        saveCanvasPicture(canvas, name)
    }
}


let image = new ImageData(512, 512);
let data = image.data;
let rowSize = 512 * 4;
for (let i = 0; i < 512; i++) {
    for (let j = 0; j < 512; j++) {
        let r = (j % 64) * 4;
        let g = (i % 64) * 4;
        let b = ((Math.floor(i / 64) * 8 + Math.floor(j / 64)) % 64) * 4;
        data[i * rowSize + j * 4] = r;
        data[i * rowSize + j * 4 + 1] = g;
        data[i * rowSize + j * 4 + 2] = b;
        data[i * rowSize + j * 4 + 3] = 255;
    }
}

console.log(image);

ctx.putImageData(image, 0, 0);



function analyzeLutFile (string) {
    let currentGroup = [];
    const emit = (token) => {
        if (token.type === 'size') {
            size = +token.content;
            
        } else if (token.type === 'number') {
            currentGroup.push(+token.content);
        } else if (token.type === 'endLine') {
            data.push(currentGroup);
            currentGroup = [];
        }
    }
    const waitingData = (c) => {
        if (c === '#') {
            currentToken.type = 'comment';
            return comment;
        } else if (/[0-9]/.test(c)) {
            currentToken = {
                type: 'number',
                content: ''
            }
            return readData(c);
        } else if (/[a-zA-Z]/.test(c)) {
            currentToken = {
                type: 'string',
                content: ''
            }
            return readFlag(c);
        }
        return waitingData;
    }

    const readFlag = (c) => {
        if (/[a-zA-Z_0-9]/.test(c)) {
            currentToken.content += c;
            return readFlag;
        } else if (currentToken.content === 'LUT_3D_SIZE' && /[\t\f ]/.test(c)) {
            currentToken = {
                type: 'size',
                content: ''
            }
            return readSize;
        }
        return readFlag;

    }

    const readSize = (c) => {
        if (/[0-9]/.test(c)) {
            currentToken.content += c;
            return readSize;
        } else {
            emit(currentToken);
            return waitingData;
        }
    }

    const comment = (c) => {
        if (/\r?\n/.test(c)) {
            return waitingData;
        }
        return comment;
    }

    const readData = (c) => {
        if (/[\t\f ]/.test(c)) {
            emit(currentToken);
            currentToken = {
                type: 'number',
                content: ''
            };
            return readData;
        } else if (/\r?\n/.test(c)) {
            emit(currentToken);
            emit({
                type: 'endLine'
            });
            return waitingData;
        } else {
            currentToken.content += c;
            return readData;
        }
    }

    let data = [];
    let currentToken = {
        type: 'string',
        content: ''
    };
    let size = 0;
    let currentState = waitingData;
    for (let c of string) {
        currentState = currentState(c);
    }
    return [size, data];
}

function mapValue(v1, v2, w1, w2) {
    return function (v) {
        return Math.round((w1 - w2) / (v1 - v2) * v + ((w1 * v2 - w2 * v1) / (v2 - v1)));
    }
}

function saveCanvasPicture (canvas, name) {
    return new Promise(resolve => {
        canvas.toBlob(function (blob) {
            let href = URL.createObjectURL(blob);
            let a = document.createElement('a');
            a.href = href;
            a.download = name;
            a.click();
            resolve();
        }, "image/jpeg");
    })
}