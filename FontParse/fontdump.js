const fs = require('fs');
const path = require('path');
const filePath = path.resolve(__dirname, '../../assets/fonts/SHOWG.TTF');
const opentype = require('opentype.js');
const debug = require('debug');


opentype.load(filePath, function (err, font) {
    if (!err) {
        let fullName = font.names.fullName;
        let fontFamily = font.names.fontFamily;
        let fontSubFamily = font.names.fontSubfamily;
        let winAscent = font.tables.os2.usWinAscent;
        let winDescent = font.tables.os2.usWinDescent;
        let unitsPerEm = font.unitsPerEm;
        let ascent = font.ascender;
        let descent = font.descender;
        let obj = {
            fullName,
            fontFamily,
            fontSubFamily,
            winAscent,
            winDescent,
            unitsPerEm,
            ascent,
            descent
        }

        console.log(obj);
    }
})


