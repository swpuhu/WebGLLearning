let section = document.querySelector('p');
let sectionWidth = section.offsetWidth;
let text = section.textContent.trim();

let fontSize = 64;
// let fontFamily = 'Parchment';
let fontFamily = 'Showcard Gothic';

let coeffcient = (2119 + 416) / 2048;
let actuallyFontSize = ~~(fontSize * coeffcient);

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
    while(cursor + currentLength < text.length) {
        currentLength = charNumsPerLine;
        let str = text.substr(cursor, currentLength);
        let strWidth = context.measureText(str).width;
        while(strWidth < sectionWidth) {
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
        context.fillText(str, 0, (currentLine + 1) * actuallyFontSize);
        ++currentLine;
    }
    str = text.substr(cursor, currentLength);
    context.fillText(str, 0, (currentLine + 1) * actuallyFontSize);


}
let bool = checkAndLoadFont(fontFamily, '../../assets/fonts/PARCHM.TTF').then(() => {
    if (bool) {
        context.font = `${fontSize}px ${fontFamily}`;
        context.textBaseline = 'ideographic';
        drawText(context, text);
        
    }

})

