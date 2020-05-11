let readWorker = new Worker('./read.js');
let input = document.createElement('input');
let width = 1280;
let height = 720;
let canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = width;
canvas.height = height;
let ctx = canvas.getContext('2d');
input.type = 'file';
document.body.appendChild(input);
let video = document.createElement('video');
video.controls = true;
document.body.appendChild(video);

input.onchange = function () {
    let file = this.files[0];
    video.src = URL.createObjectURL(file);
    let fileReader = new FileReader();
    fileReader.onload = function () {
        let buffer = new Uint8Array(this.result);

        readWorker.postMessage(buffer);
    }

    
    fileReader.readAsArrayBuffer(file);
}

let frameQueue = [];

function play() {
    if (!frameQueue.length) return;
    ctx.clearRect(0, 0, width, height);
    ctx.putImageData(frameQueue.shift(), 0, 0);
    let a = document.createElement('a');
    a.download = frameCount + 'png';
    a.href = canvas.toDataURL();
    a.click();
    setTimeout(play, 500);
}

let frameCount = 0;
readWorker.onmessage = function (e) {
    
    if (frameCount > 10 ) return;
    frameCount++;
    frameQueue.push(e.data);
    play();
}


