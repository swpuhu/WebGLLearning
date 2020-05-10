
self.Module = {
    onRuntimeInitialized: function () {
        onWasmLoaded();
    }
};
self.importScripts('./avio_reading.js')
self.importScripts('./messageType.js');
self.importScripts('./yuv.js');
let videoCallback;
self.onmessage = function (e) {
    let data = e.data;
    let addr = Module._malloc(data.byteLength * this.Uint8Array.BYTES_PER_ELEMENT);
    Module.HEAPU8.set(data, addr);
    Module._initDecoder(addr, data.byteLength, videoCallback);
    Module._decodeOnePacket(0);
    Module._closeDecoder();
    Module._free(addr);
}

function onWasmLoaded () {
    videoCallback = Module.addFunction(function (buff, width, hieght) {
        let imageData = bufferToImageData(buff,width, hieght);
        self.postMessage(imageData, [imageData.data.buffer]);
    }, 'viii');
    // self.postMessage('read worker is ready!');
}