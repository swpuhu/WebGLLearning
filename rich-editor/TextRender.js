import { checkAndLoadFont } from './FontLoader.js';

const defaultParams = {
    fontSize: 16,
    fontFamily: 'Microsoft YaHei'
}

function parseStyleAttributes (str) {
    let arr = str.split(';');
    let style = {};
    if (arr.length % 2 !== 0) {
        arr.pop();
    }
    for (let i = 0; i < arr.length; i++) {
        let str = arr[i];
        if (str.trim()) {
            let [key, value] = str.split(':');
            style[key.trim()] = value.trim().replace(/["']/g, '');
        }
    }
    return style;
}

class TextRender {
    constructor(canvas, fonts) {
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.context = canvas.getContext('2d');
        this.fonts = fonts;
    }

    _analyze (html) {
        let fontFamilies = new Set();
        let maxFontSize = 0;
        let font = '';
        let currentFont = '';
        let json = this.DFSHTML(html, (item) => {
            if (item.style.fontFamily) {
                fontFamilies.add(item.style.fontFamily.replace(/['"']/g, ''));
            }
            if (item.style.fontFamily) {
                currentFont = item.style.fontFamily;
            }
        });


        return [fontFamilies, json, maxFontSize, font];
    }

    drawHTML(html) {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        let [fontFamilies, json, maxFontSize, font] = this._analyze(html);
        let promises = [];
        for (let fontFamily of fontFamilies) {
            let params = this.fonts.find(item => (item.familyName === fontFamily));
            if (params) {
                let url = params.filePath;
                promises.push(checkAndLoadFont(fontFamily, url));
            }
        }
        Promise.all(promises).then(() => {
            let currentStyle = {
                fontFamily: 'SimHei Regular',
                fontSize: 16,
                lineHeight: 0,
                fontStyle: 'normal',
                fontWeight: 'normal',
                textAlign: 'left',
                color: '#000',
            }
            let emptyLine = false;
            let lineCount = -1;
            let offsetX = 0;
            let offsetY = 0;
            let currentHeight = 0;
            let help = (res, parentStyles, maxSize, maxSizeFont) => {
                if (res.children) {
                    let styles = { ...parentStyles, ...res.styles };
                    if (res.isRow && !emptyLine) {
                        console.log('new line');
                        emptyLine = true;
                        ++lineCount;
                        offsetX = 0;
                        offsetY += currentHeight;
                    }
                    let _maxSize = res.maxSize || maxSize;
                    let _maxSizeFont = res.maxSizeFont || maxSizeFont;
                    
                    for (let child of res.children) {
                        help(child, styles, _maxSize, _maxSizeFont);
                    }
                    emptyLine = false;
                } else {
                    let fontFamily = parentStyles['font-family'] || defaultParams.fontFamily;
                    let fontSize = parseInt(parentStyles['font-size']) || defaultParams.fontSize;
                    let [baselineOffset, lineHeight, rate] = this._getBaselineOffset(maxSizeFont, maxSize);
                    let fontWeight = parentStyles['font-weight'] || 'normal';
                    let fontStyle = parentStyles['font-style'] || 'normal';
                    let color = parentStyles['color'];
                    let backColor = parentStyles['background-color'];
                    let shadowColor = parentStyles['shadow'];
                    currentHeight = lineHeight;
                    offsetX += this.drawText(res, fontFamily, fontSize, lineHeight, fontStyle, fontWeight, 'left', color, backColor, shadowColor, offsetX, baselineOffset, offsetY);
                    console.log(res, parentStyles);
                }
            }
            help(json, {});
        });
    }

    _getBaselineOffset (font, fontSize, lineHeight) {
        let params = this.fonts.find(item => (item.fullName === font));
        let winAscent = params.winAscent;
        let winDescent = params.winDescent;
        let ascender = params.ascender;
        let descender = -params.descender;
        let typoAscent = params.typoAscent;
        let typoDescent = -params.typoDescent;
        let HHAscent = params.HHAscent;
        let HHDescent = -params.HHDescent;
        let unitsPerEm = params.unitsPerEM;
        let useTypoMetrics = params.useTypoMetrics;
        fontSize = Math.floor(fontSize);
        let coefficient;
        if (/mac/i.test(navigator.platform)) {
            coefficient = (HHAscent + HHDescent) / unitsPerEm;
        } else if (useTypoMetrics) {
            coefficient = (typoAscent + typoDescent) / unitsPerEm;
        } else {
            coefficient = (winAscent + winDescent) / unitsPerEm;
        }
        let contentHeight = Math.round(fontSize * coefficient);
        let lineHeightPx;
        if (!lineHeight) {
            lineHeightPx = contentHeight;
        } else {
            lineHeightPx = Math.floor(fontSize * lineHeight);
        }

        let halfLineHeight = (lineHeightPx - contentHeight) / 2;
        let offsetY;
        if (/mac/i.test(navigator.platform)) {
            offsetY = halfLineHeight + contentHeight * HHAscent / (HHAscent + HHDescent);
            return [offsetY, lineHeightPx, HHAscent / (HHAscent + HHDescent)];
        } else if (useTypoMetrics) {
            offsetY = halfLineHeight + contentHeight * typoAscent / (typoAscent + typoDescent);
            return [offsetY, lineHeightPx, typoAscent / (typoAscent + typoDescent)];
        } else {
            offsetY = halfLineHeight + contentHeight * winAscent / (ascender + descender);
            return [offsetY, lineHeightPx, winAscent / (ascender + descender)];
        }

    }

    DFSHTML (html, handler) {

        if (!html.innerHTML) return html.textContent;
        let obj = {
            styles: {},
            children: []
        };
        handler && handler(html);
        for (let i = 0; i < html.childNodes.length; i++) {
            if (html.childNodes.length) {
                let res = this.DFSHTML(html.childNodes[i], handler);
                if (html.childNodes[i] instanceof Text === false && typeof res !== 'string') {
                    if (html.childNodes[i].tagName === 'DIV') {
                        res.isRow = true;
                        [res.maxSize, res.maxSizeFont] = this.findMaxFont(res);
                    }
                    let style = html.childNodes[i].getAttribute('style');
                    if (style) {
                        res.styles = parseStyleAttributes(style);
                    }
                }
                if (!/^\r?\n/.test(res)) {
                    obj.children.push(res);
                }
            }
        }
        return obj;
    }

    findMaxFont (res) {
        let maxFontSize = defaultParams.fontSize;
        let maxFontFamily = defaultParams.fontFamily;
        let map = new Map();
        let maxContentHeight = 0;
        let queue = [[res, {}]];
        while (queue.length) {
            let [item, parentStyles] = queue.shift();
            let styles = {...item.styles, ...parentStyles};
            if (styles['font-size'] && styles['font-family'] || styles['font-family']) {
                let fontSize = styles['font-size'] || defaultParams.fontSize;
                fontSize = parseInt(fontSize);
                let fontFamily = styles['font-family'] || defaultParams.fontFamily;
                let contentHeight = this._getBaselineOffset(fontFamily, fontSize)[1];
                if (contentHeight > maxContentHeight) {
                    maxContentHeight = contentHeight;
                    maxFontSize = fontSize;
                    maxFontFamily = fontFamily;
                }
                
            }
            if (item.children) {
                for (let child of item.children) {
                    if (typeof child === 'string') {
                        continue;
                    }
                    queue.push([child, styles]);
                }
            }
        }
        return [maxFontSize, maxFontFamily];
    }


    drawText (text, fontFamily = 'SimHei Regular', fontSize = 16, lineHeight = 0, fontStyle = 'normal', fontWeight = 'normal', textAlign = 'left', color = '#000', backgroundColor, shadowColor, offsetX, baselineOffset, offsetY) {
        this.context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        this.context.textAlign = textAlign;
        this.context.textBaseline = 'alphabetic';
        if (shadowColor) {
            this.context.shadowColor = shadowColor;
            this.context.shadowOffsetX = 2;
            this.context.shadowOffsetY = 2;
            this.context.shadowBlur = 2;
        }
        if (backgroundColor) {
            this.context.fillStyle = backgroundColor;
            this.context.rect(0, 0, canvas.width, canvas.height);
            this.context.fill();
        }
        let width = this.context.measureText(text).width;
        this.context.fillStyle = color;
        let dY = offsetY + baselineOffset;
        this.context.fillText(text, offsetX, dY);
        return width;
    }
}


export {
    TextRender
}