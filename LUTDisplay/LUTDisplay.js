const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
document.body.appendChild(canvas);

const inputFile = document.createElement('input');
inputFile.type = 'file';
document.body.appendChild(inputFile);

const context = canvas.getContext('2d');

let data = new ImageData(512, 512);

inputFile.onchange = function () {
    let file = this.files[0];
    let fileReader = new FileReader();
    fileReader.onload = function () {
        let buffer = new Uint8Array(this.result);
        let processor = new Process();
        for (let i = 0; i < buffer.length; i++) {
            let code = buffer[i];
            let char = String.fromCharCode(code);
            // if (char === '3' ) debugger;
            processor.process(char);
        }

        console.log(processor.result.length);
        // let rowCount = 
        for (let i = 0; i < data.width * 4; i += 256) {
            for (let j = 0; j < data.height; j += 64) {
                for (let k = 0; k < 64; k++) {
                    data.data[i * ]
                }
            }
        }
        // data.data.fill(204);
        // context.fillStyle = '#ccc';
        // context.fillRect(0, 0, canvas.width, canvas.height);
        // let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        context.putImageData(data, 0, 0);
    }
    fileReader.readAsArrayBuffer(file);
}





// let testStr = '0.123 0.154 0.1154 asdf 0.15 #asdasd';

// let processor = Process();
// for (let c of testStr) {
//     processor.process(c);
// }

// console.log(processor.result)

function Process() {
    let str = '';
    let numbers = [];
    let obj = {};
    function isAlpha (char) {
        return /[a-zA-Z]/.test(char);
    }

    function isDigital(char) {
        return /\d/.test(char);
    }

    function isPoint(char) {
        return /\./.test(char);
    }

    function isSharpChar(char) {
        return /#/.test(char);
    }

    function isblank(char) {
        return /\s/.test(char);
    }

    function isCarriage (char) {
        return /\n/.test(char);
    }

    const states = {
        INT: 0,
        FLOAT: 1,
        WORD: 2,
        COMMENT: 3,
        END: 4,
        OTHER: 5
    };
    let state = states.END;
    
    function initState (char) {
        if(isAlpha(char)) {
            state = states.WORD
        } else if (isDigital(char)) {
            state = states.INT;
        } else {
            state = states.OTHER;
        }
        str += char;
    }

    function process(char) {
        if (state === states.WORD) {
            if (isblank(char)) {
                str = '';
                state = states.END;
            } else {
                str += char;
            }
        } else if (state === states.INT) {
            if (isDigital(char)) {
                str += char;
            } else if (isPoint(char)) {
                state = states.FLOAT;
                str += char;
            } else if (isAlpha(char)) {
                state = states.WORD;
                str += char;
            } else {
                numbers.push(+str);
                str = '';
                state = states.END;
            }
        } else if (state === states.FLOAT) {
            if (!isDigital(char)) {
                numbers.push(+str);
                str = '';
                state = states.END;
            } else {
                str += char;
            }
        } else if (state === states.COMMENT) {
            if (isCarriage(char)) {
                str = '';
                state = states.END;
            } else {
                str += char;
            }
        } else if (state === states.END) {
            initState(char);
        } else {
            str = '';
            state = states.END;
        }
    }

    Object.defineProperties(obj, {
        process: {
            value: process
        },
        result: {
            get () {
                return numbers;
            }
        }
    })
    return obj;
}