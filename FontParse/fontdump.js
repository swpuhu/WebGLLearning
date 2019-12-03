const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, '../../assets/fonts/SHOWG.TTF');
const opentype = require('opentype.js');
const debug = require('debug');


opentype.load(filePath, function (err, font) {
    if (!err) {
        console.log(font.names.fullName)
        console.log(font.tables.os2);
        console.log('unitsPerEm: ' + font.unitsPerEm);
        console.log('ascender: ' + font.ascender);
        console.log('descender: ' + font.descender);
    }
})


