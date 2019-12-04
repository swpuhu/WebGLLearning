let params = {
    'Showcard Gothic': {
        winAscent: 2119,
        winDescent: 416,
        ascent: 1633,
        descent: 415,
        unitsPerEm: 2048
    },
    'Parchment': {
        winAscent: 1534,
        winDescent: 651,
        ascent: 1638,
        descent: 410,
        unitsPerEm: 2048

    }
}



let section = document.querySelector('p');
let sectionWidth = 189;

let text = section.innerText;
let textAlign = 'left';
let lineHeight = 1.25;
let fontSize = 28.8;
// let fontFamily = 'Showcard Gothic';
let fontFamily = 'Parchment';
let fontStyle = 'italic';
fontSize = Math.round(fontSize);


section.style.textAlign = textAlign;
section.style.lineHeight = lineHeight;
section.style.fontSize = fontSize + 'px';
section.style.fontFamily = fontFamily;
section.style.fontStyle = fontStyle;
section.style.width = sectionWidth + 'px';

let winAscent = params[fontFamily].winAscent;
let winDescent = params[fontFamily].winDescent;
let ascent = params[fontFamily].ascent;
let descent = params[fontFamily].descent;
let unitsPerEm = params[fontFamily].unitsPerEm;

let coeffcient = Math.round((winAscent + winDescent) / unitsPerEm * 100) / 100;
let actuallyFontSize = Math.round(fontSize * coeffcient);
lineHeight = Math.round(fontSize * lineHeight);
let halfLineHeight = (lineHeight - actuallyFontSize) / 2;
let offsetY = halfLineHeight + ((winAscent - ascent) / unitsPerEm * fontSize);
let offsetX = 0;
if (textAlign === 'left') {
    offsetX = 0;
} else if (textAlign === 'center') {
    offsetX = sectionWidth / 2;
} else {
    offsetX = sectionWidth;
}
/**
 * @type {HTMLCanvasElement}
 */
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');


function loadFont(fontFamily, url) {
    return new Promise((resolve, reject) => {
        let font = new FontFace(fontFamily, `url(${url})`);
        font.load().then(() => {
            document.fonts.add(font);
            resolve();  
        }).catch(reject);
    })

}

function checkAndLoadFont(name, url = '') {
    return new Promise((resolve, reject) => {
        let values = document.fonts.values();
        let isHave = false;
        let item = values.next();
        while(!item.done && !isHave) {
            let fontFace = item.value;
            if (fontFace.family === name) {
                isHave = true;
                if (fontFace.status === 'loaded') {
                    resolve();
                } else {
                    fontFace.loaded.then(resolve)
                }
            }
            item = values.next();
        }

        if (!isHave) {
            loadFont(name, url)
            .then(resolve)
            .catch(reject);
        }
    })
}

function isBlank(char) {
    return /\s/.test(char);
}

function isPunctuation(char) {
    return /[,\.";:]/.test(char);
}


/**
 * 
 * @param {CanvasRenderingContext2D} context 
 * @param {string} text 
 */
function drawText(context, text) {
    let totalWidth = context.measureText(text).width;
    let lines = Math.ceil(totalWidth / sectionWidth);
    let cursor = 0;
    let charNumsPerLine = Math.floor(text.length / lines);
    let currentLength = charNumsPerLine;
    let currentLine = 0;
    while(cursor + currentLength <= text.length) {
        currentLength = charNumsPerLine;
        let str = text.substr(cursor, currentLength);
        if (/\n/.test(str)) {
            let pos = str.indexOf('\n');
            if (pos > 0) {
                currentLength = pos;
                str = str.substr(0, pos);
            }
            currentLength = pos;
        }
        let strWidth = context.measureText(str).width;
        while(strWidth < sectionWidth) {
            let nextChar = text[cursor + currentLength];
            if (/\n/.test(str) || cursor + currentLength >= text.length) break;
            ++currentLength;
            str = text.substr(cursor, currentLength);
            strWidth = context.measureText(str).width;
        }
        while(strWidth > sectionWidth) {
            --currentLength;
            str = text.substr(cursor, currentLength);
            strWidth = context.measureText(str).width;
        }
        
        
        let nextChar = text[cursor + currentLength];
        if (isBlank(nextChar)) {
            ++cursor;
        } else if (isPunctuation(nextChar)) {
            let width = context.measureText(str + nextChar).width;
            if (width > sectionWidth) {
                currentLength--;
            } else {
                currentLength++;
                str = str + nextChar;
            }
        }
        cursor += currentLength;
        let dY = currentLine * lineHeight + offsetY;
        context.fillText(str, offsetX, dY);
        ++currentLine;
    }
    str = text.substr(cursor, currentLength);
    let remainStr = str;
    let pos = remainStr.indexOf('\n');
    while(pos > 0) {
        let dY = currentLine * lineHeight + offsetY;
        str = remainStr.substr(0, pos);
        context.fillText(str, offsetX, dY);
        ++currentLine;
        remainStr = remainStr.substr(pos + 1);
        pos = remainStr.indexOf('\n');
        offsetY += halfLineHeight;
    }
    let dY = currentLine * lineHeight + offsetY;
    context.fillText(remainStr, offsetX, dY);


}
let bool = checkAndLoadFont(fontFamily, '../../assets/fonts/PARCHM.TTF').then(() => {
    if (bool) {
        context.font = `italic ${fontSize}px ${fontFamily}`;
        context.textAlign = textAlign
        context.textBaseline = 'top';
        sectionWidth = section.offsetWidth;
        drawText(context, text);
        
    }

})

