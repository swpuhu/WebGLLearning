let params = {
    'Showcard Gothic': {
        winAscent: 2119,
        winDescent: 416,
        ascent: 1633,
        descent: 415,
        unitsPerEm: 2048,
        url: '../../assets/fonts/SHOWG.TTF'
    },
    'Parchment': {
        winAscent: 1534,
        winDescent: 651,
        ascent: 1638,
        descent: 410,
        unitsPerEm: 2048,
        url: '../../assets/fonts/PARCHM.TTF'
    },
    'Adobe Caslon Pro': {
        winAscent: 1002,
        winDescent: 700,
        ascent: 735,
        descent: 265,
        unitsPerEm: 1000,
        url: '../../assets/fonts/ACaslonPro-Regular.otf'
    },
    'Adobe Caslon Pro Bold': {
        winAscent: 1002,
        winDescent: 700,
        ascent: 735,
        descent: 265,
        unitsPerEm: 1000,
        url: '../../assets/fonts/ACaslonPro-Bold.otf'
    }
}



let section = document.querySelector('p');
let sectionWidth = 189;

let text = section.innerText;
let textAlign = 'left';
let lineHeight = 2.5;
let fontSize = 26;
// let fontFamily = 'Showcard Gothic';
let fontFamily = 'Parchment';
let fontStyle = 'italic';
let fontWeight = 'bold';


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
        while (!item.done && !isHave) {
            let fontFace = item.value;
            if (fontFace.family === name) {
                isHave = true;
                if (fontFace.status === 'loaded') {
                    resolve();
                } else {
                    fontFace.loaded.then(resolve)
                    fontFace.load();
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
function drawText(context, text, offsetX, offsetY, lineHeightPx) {
    let totalWidth = context.measureText(text).width;
    let lines = Math.ceil(totalWidth / sectionWidth);
    let cursor = 0;
    let charNumsPerLine = Math.floor(text.length / lines);
    let currentLength = charNumsPerLine;
    let currentLine = 0;
    while (cursor + currentLength <= text.length) {
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
        while (strWidth < sectionWidth) {
            let nextChar = text[cursor + currentLength];
            if (/\n/.test(str) || cursor + currentLength >= text.length) break;
            ++currentLength;
            str = text.substr(cursor, currentLength);
            strWidth = context.measureText(str).width;
        }
        while (strWidth > sectionWidth) {
            --currentLength;
            str = text.substr(cursor, currentLength);
            if (currentLength === 1) {
                break;
            }
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
        let dY = currentLine * lineHeightPx + offsetY;
        context.fillText(str, offsetX, dY);
        ++currentLine;
    }
    str = text.substr(cursor, currentLength);
    let remainStr = str;
    let pos = remainStr.indexOf('\n');
    while (pos > 0) {
        let dY = currentLine * lineHeightPx + offsetY;
        str = remainStr.substr(0, pos);
        context.fillText(str, offsetX, dY);
        ++currentLine;
        remainStr = remainStr.substr(pos + 1);
        pos = remainStr.indexOf('\n');
    }
    let dY = currentLine * lineHeightPx + offsetY;
    context.fillText(remainStr, offsetX, dY);


}

function render() {
    let bool = checkAndLoadFont(fontFamily, params[fontFamily].url).then(() => {
        if (bool) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            fontSize = Math.round(fontSize);

            section.style.textAlign = textAlign;
            section.style.lineHeight = lineHeight;
            section.style.fontSize = fontSize + 'px';
            section.style.fontFamily = fontFamily;
            section.style.fontStyle = fontStyle;
            section.style.width = sectionWidth + 'px';
            section.style.fontWeight = fontWeight;
            context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            context.textAlign = textAlign
            context.textBaseline = 'top';


            let winAscent = params[fontFamily].winAscent;
            let winDescent = params[fontFamily].winDescent;
            let ascent = params[fontFamily].ascent;
            let descent = params[fontFamily].descent;
            let unitsPerEm = params[fontFamily].unitsPerEm;

            let coeffcient = Math.round((winAscent + winDescent) / unitsPerEm * 100) / 100;
            let actuallyFontSize = Math.round(fontSize * coeffcient);
            let lineHeightPx = Math.floor(fontSize * lineHeight);
            let halfLineHeight = (lineHeightPx - actuallyFontSize) / 2;
            let diffWinAscent = (Math.round((winAscent - ascent) / unitsPerEm * fontSize));
            if (diffWinAscent < 0) {
                diffWinAscent = 0;
            }
            let offsetY = halfLineHeight + diffWinAscent;
            let offsetX = 0;
            if (textAlign === 'left') {
                offsetX = 0;
                context.direction = 'ltr';
            } else if (textAlign === 'center') {
                offsetX = sectionWidth / 2;
                context.direction = 'ltr';
            } else {
                offsetX = sectionWidth;
                context.direction = 'rtl';
            }
            drawText(context, text, offsetX, offsetY, lineHeightPx);
        }
    })
}


function DashBoard(wrapper) {
    let font = document.createElement('select');
    for (let key in params) {
        let option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        font.appendChild(option);
    }
    font.onchange = function () {
        fontFamily = font.value;
        render();
    };

    let bold = document.createElement('button');
    bold.textContent = 'Bold';
    bold.onclick = function () {
        if (fontWeight === 'bold') {
            fontWeight = 'normal';
        } else {
            fontWeight = 'bold';
        }
        render();
    }

    let italic = document.createElement('button');
    italic.textContent = 'italic';
    italic.onclick = function () {
        if (fontStyle === 'italic') {
            fontStyle = 'normal';
        } else {
            fontStyle = 'italic';
        }
        render();
    }

    let flexLineHeight = document.createElement('div');
    flexLineHeight.classList.add('flex')
    let nameLineHeight = document.createElement('div');
    nameLineHeight.textContent = '行高';
    let inputLineHeight = document.createElement('input');
    inputLineHeight.type = 'number';
    inputLineHeight.step = 0.1;
    inputLineHeight.value = 2;
    inputLineHeight.onchange = function () {
        lineHeight = inputLineHeight.value;
        render();
    }
    flexLineHeight.appendChild(nameLineHeight);
    flexLineHeight.appendChild(inputLineHeight);

    
    let flexFontSize = document.createElement('div');
    flexFontSize.classList.add('flex')
    let nameFontSize = document.createElement('div');
    nameFontSize.textContent = '字号';
    let inputFontSize = document.createElement('input');
    inputFontSize.value = 16;
    inputFontSize.type = 'number';
    inputFontSize.onchange = function () {
        fontSize = inputFontSize.value;
        render();
    }
    flexFontSize.appendChild(nameFontSize);
    flexFontSize.appendChild(inputFontSize);

    wrapper.appendChild(font);
    wrapper.appendChild(bold);
    wrapper.appendChild(italic);
    wrapper.appendChild(flexLineHeight);
    wrapper.appendChild(flexFontSize);
    



    this.font = font;
}
let wrapper = document.querySelector('.dashboard');
let dashBoard = new DashBoard(wrapper);



render();

