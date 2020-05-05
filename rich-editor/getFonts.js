let Module = require('./Dev-font/wasm/readfont_node2');
const path = require('path');
const fs = require('fs');
const fontDir = path.resolve(__dirname, './fonts');
const opentype = require('opentype.js');
const taskQ = [];
let isReady = false;
let fontInfos = null;
Module.onRuntimeInitialized = function () {
    isReady = true;
    while (taskQ.length) {
        let task = taskQ.shift();
        task();
    }
};
function readFontDir (dir) {
    let files = fs.readdirSync(dir);
    for (let f of files) {
        let p = path.resolve(dir, f);
        let stats = fs.statSync(p);
        if (stats.isFile()) {
            if (!/(ttf)|(otf)/i.test(p)) continue;
            fontInfos.push(readFontFile(p, f));
        } else {
            readFontDir(p);
        }
    }
}
function decode(arr) {
    var rs = '';
    for (var i = 0; i < arr.length; i++) {
        var code = arr[i]
        // console.log(code);
        if ((240 & code) == 240) {
            var code1 = arr[i + 1],
                code2 = arr[i + 2],
                code3 = arr[i + 3];
            rs += String.fromCodePoint(((code & 7) << 18) | ((code1 & 63) << 12) | ((code2 & 63) << 6) | (code3 & 63));
            i += 3;
        } else if ((224 & code) == 224) {
            var code1 = arr[i + 1],
                code2 = arr[i + 2];
            rs += String.fromCodePoint(((code & 15) << 12) | ((code1 & 63) << 6) | (code2 & 63));
            i += 2;
        } else if ((192 & code) == 192) {
            var code1 = arr[i + 1];
            rs += String.fromCodePoint(((code & 31) << 6) | (code1 & 63));
            i++;
        } else if ((128 & code) == 0) {
            rs += String.fromCharCode(code);
        }
    }
    // console.log(rs);
    return rs;
}
function readFontFile (filePath, fileName) {
    let data = fs.readFileSync(filePath);
    let offset = Module._malloc(data.length);
    console.log(offset);
    
    Module.HEAPU8.set(data, offset);
    let ret = Module._read_font(offset, data.byteLength);
    // console.log(ret);
    
    let familyName = '';
    let styleName = '';
    let familyNameAddr = Module.HEAPU32[ret / 4];
    let styleNameAddr = Module.HEAPU32[ret / 4 + 1];
    let arr = [];
    for (let i = familyNameAddr; Module.HEAPU8[i] !== 0; i++) {
        arr.push(Module.HEAPU8[i]);
    }
    
    
    familyName = decode(arr);
    arr = [];
    for (let i = styleNameAddr; Module.HEAPU8[i] !== 0; i++) {
        styleName += String.fromCharCode(Module.HEAPU8[i]);
    }
    let unitsPerEM = Module.HEAP16[ret / 2 + 4];
    let ascender = Module.HEAP16[ret / 2 + 5];
    let descender = Module.HEAP16[ret / 2 + 6];
    let max_advance_height = Module.HEAP16[ret / 2 + 7];
    let underline_position = Module.HEAP16[ret / 2 + 8];
    let underline_thickness = Module.HEAP16[ret / 2 + 9];
    let max_advance_width = Module.HEAP16[ret / 2 + 10];
    // console.log(__dirname);
    Module._free(offset);
    let font = opentype.parse(data.buffer);
    let winAscent = font.tables.os2.usWinAscent;
    let winDescent = font.tables.os2.usWinDescent;
    let HHAscent = font.tables.hhea.ascender;
    let HHDescent = font.tables.hhea.descender;
    let typoAscent = font.tables.os2.sTypoAscender;
    let typoDescent = font.tables.os2.sTypoDescender;
    let useTypoMetrics = !!(font.tables.os2.fsSelection & 0b10000000);
    let fullName = font.names.fontFamily.en;
    return {
        familyName,
        fullName,
        styleName,
        ascender,
        descender,
        unitsPerEM,
        max_advance_height,
        max_advance_width,
        underline_position,
        underline_thickness,
        winAscent,
        winDescent,
        HHAscent,
        HHDescent,
        typoAscent,
        typoDescent,
        fileName,
        useTypoMetrics,
        filePath: filePath.substr(__dirname.length).replace(/\\/g, '\\\\')
    }
}
if (isReady) {
    if (fontInfos) {
    } else {
        fontInfos = [];
        readFontDir(fontDir);
    }

} else {
    taskQ.push(() => {

        if (fontInfos) {
        } else {
            fontInfos = [];
            readFontDir(fontDir);
        }
    })
}

module.exports = function (req, res) {
    if (fontInfos) {
        res.send(fontInfos);
    } else {
        fontInfos = [];
        readFontDir(fontDir);
        res.send(fontInfos);
    }
}