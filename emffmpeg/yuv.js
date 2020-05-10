let y = [16, 235];
let u = [16, 240];
let v = [16, 240];

let rgb = [0, 255];

function transform(value) {
    return value;
    // return Math.round((value - y[0]) / (y[1] - y[0]) * 255);
}

function yuv420ToRgb(y, u, v) {
    return [
        y + 1.4075 * (v - 128),
        y - 0.3455 * (u - 128) - 0.7169 * (v - 128),
        y + 1.779 * (u - 128)
    ]
}

function bufferToImageData(buffer, width, height) {
    let yLineSize = width;
    let uLineSize = width / 2;
    let vLineSize = width / 2;
    let imageData = new ImageData(width, height);
    buffer = Module.HEAPU8.subarray(buffer, buffer + width * height * 3 / 2);
    for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
            let y = buffer[r * yLineSize + c];
            let u = buffer[width * height + Math.floor(r / 2) * uLineSize + Math.floor(c / 2)];
            let v = buffer[width * height * 5 / 4 + Math.floor(r / 2) * vLineSize + Math.floor(c / 2)];

            let [_r, g, b] = yuv420ToRgb(y, u, v);
            imageData.data[r * width * 4 + c * 4] = _r;
            imageData.data[r * width * 4 + c * 4 + 1] = g;
            imageData.data[r * width * 4 + c * 4 + 2] = b;
            imageData.data[r * width * 4 + c * 4 + 3] = 255;
        }
    }
    return imageData;
}