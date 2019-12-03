let section = document.querySelector('p');
let sectionWidth = section.offsetWidth;
let text = section.innerText;
let lineHeight = 2.5;
let fontSize = 80;
// let fontFamily = 'Parchment';
let fontFamily = 'Showcard Gothic';

let coeffcient = (2119 + 416) / 2048;
let actuallyFontSize = Math.round(fontSize * coeffcient);
let actuallyLineHeight = fontSize * lineHeight;
let halfLineHeight = (actuallyLineHeight - actuallyFontSize) / 2.0;
halfLineHeight = (actuallyLineHeight - fontSize) / 2;

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
    let offsetY = 0;
    while(cursor + currentLength <= text.length) {
        offsetY += halfLineHeight;
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
            if (isBlank(nextChar) || cursor + currentLength >= text.length) break;
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
        // if (currentLine === 0) {
        //     offsetY -= halfLineHeight;
        // }
        context.fillText(str, 0, offsetY);
        offsetY += (halfLineHeight + actuallyFontSize);
        ++currentLine;
    }
    str = text.substr(cursor, currentLength);
    let remainStr = str;
    let pos = remainStr.indexOf('\n');
    while(pos > 0) {
        offsetY += (actuallyFontSize - halfLineHeight);
        str = remainStr.substr(0, pos);
        context.fillText(str, 0, offsetY);
        ++currentLine;
        remainStr = remainStr.substr(pos + 1);
        pos = remainStr.indexOf('\n');
        offsetY += halfLineHeight;
    }
    offsetY += (actuallyFontSize - halfLineHeight);
    context.fillText(remainStr, 0, offsetY);


}
let bool = checkAndLoadFont(fontFamily, '../../assets/fonts/PARCHM.TTF').then(() => {
    if (bool) {
        context.font = `${fontSize}px ${fontFamily}`;
        context.textBaseline = 'top';
        sectionWidth = section.offsetWidth;
        drawText(context, text);
        
    }

})

