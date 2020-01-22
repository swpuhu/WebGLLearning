const fs = require('fs');
const path = require('path');
const fileName = 'SRGSSRTypeSerif_Rg';
const suffix = 'ttf'
const filePath = path.resolve(__dirname, '../../assets/fonts/' + fileName + '.' + suffix);
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
        // fs.writeFile(path.resolve(__dirname, fileName + '.json'), JSON.stringify(font.tables.os2), function (err) {
        //     if(!err) {
        //         console.log('ok!');
        //     }
        // });
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


