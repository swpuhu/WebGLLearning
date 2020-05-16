import { checkAndLoadFont } from './FontLoader.js';
import { RichEditor } from './RichEditor.js';

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
    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     * @param {RichEditor} editor 
     * @param {Object} fonts 
     */
    constructor(canvas, editor, fonts) {
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.context = canvas.getContext('2d');
        this.editor = editor;
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
            let prevLineHeight = 0;
            let help = (res, parentStyles, maxSize, maxSizeFont) => {
                if (res.children) {
                    let styles = { ...parentStyles, ...res.styles };
                    if (res.isRow && !emptyLine) {
                        console.log('new line');
                        emptyLine = true;
                        ++lineCount;
                        offsetX = 0;
                        offsetY += prevLineHeight;
                        if (res.lineHeight) {
                            prevLineHeight = res.lineHeight;
                        } else {
                            let lineHeight = this._getBaselineOffset(defaultParams.fontFamily, defaultParams.fontSize)[1];
                            prevLineHeight = lineHeight;
                        }
                        
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
                    let [baselineOffset, lineHeight] = this._getBaselineOffset(maxSizeFont, maxSize);
                    let fontWeight = parentStyles['font-weight'] || 'normal';
                    let fontStyle = parentStyles['font-style'] || 'normal';
                    let color = parentStyles['color'];
                    let backColor = parentStyles['background-color'];
                    let shadowColor = parentStyles['shadow'];
                    let underline = parentStyles['text-decoration-line'];
                    let params = this.fonts.find(item => (item.familyName === fontFamily));
                    let underlineParams = null;
                    if (underline) {
                        let totalHeight;
                        if (/mac/i.test(navigator.platform)) {
                            totalHeight = params.HHAscent + params.HHDescent;
                        } else if (params.useTypoMetrics) {
                            totalHeight = params.typoAscent + params.typoDescent;
                        } else {
                            totalHeight = params.winAscent + params.winDescent;
                        }
                        underlineParams = {
                            underlinePosition: params.underline_position / totalHeight * fontSize,
                            underlineThickness: params.underline_thickness / totalHeight * fontSize
                        }
                    }
                    currentHeight = lineHeight;
                    offsetX += this.drawText(res, fontFamily, fontSize, lineHeight, fontStyle, fontWeight, 'left', color, backColor, shadowColor, underlineParams, offsetX, baselineOffset, offsetY);
                    console.log(res, parentStyles);
                }
            }
            help(json, {});
        });
    }

    _getBaselineOffset (font, fontSize, lineHeight) {
        if (this.editor.container.style.lineHeight) {
            lineHeight = +this.editor.container.style.lineHeight;
        }
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
            offsetY = halfLineHeight + contentHeight * winAscent / (winAscent + winDescent);
            return [offsetY, lineHeightPx, winAscent / (winAscent + winDescent)];
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
                        [res.maxSize, res.maxSizeFont, res.lineHeight] = this.findMaxFont(res);
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
        let upper = 0;
        let lower = 0;
        if (res.children && res.children[0] && res.children[0].isRow) {
            return [res.children[0].maxFontSize, res.children[0].maxFontFamily, res.children[0].lineHeight];
        }
        while (queue.length) {
            let [item, parentStyles] = queue.shift();
            let styles = { ...item.styles, ...parentStyles };
            let fontSize = styles['font-size'] || defaultParams.fontSize;
            fontSize = parseInt(fontSize);
            let fontFamily = styles['font-family'] || defaultParams.fontFamily;
            let [offsetY, contentHeight, ratio] = this._getBaselineOffset(fontFamily, fontSize);
            if (styles['font-size'] || styles['font-family']) {
                if (contentHeight > maxContentHeight) {
                    maxContentHeight = contentHeight;
                    maxFontSize = fontSize;
                    maxFontFamily = fontFamily;
                } 
            }
            let _upper = contentHeight * ratio;
            let _lower = contentHeight * (1 - ratio);
            if (_upper > upper) {
                upper = _upper;
            }
            if (_lower > lower) {
                lower = _lower;
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
        let lineHeight = Math.round(upper + lower);
        return [maxFontSize, maxFontFamily, lineHeight];
    }


    drawText (text, fontFamily = 'SimHei Regular', fontSize = 16, lineHeight = 0, fontStyle = 'normal', fontWeight = 'normal', textAlign = 'left', color = '#000', backgroundColor, shadowColor, underlineParams, offsetX, baselineOffset, offsetY) {
        this.context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        this.context.textAlign = textAlign;
        this.context.textBaseline = 'alphabetic';
        let width = this.context.measureText(text).width;
        if (1) {
            this.context.shadowColor = '#ff0';
            this.context.shadowOffsetX = 2;
            this.context.shadowOffsetY = 2;
            this.context.shadowBlur = 2;
        }
        if (backgroundColor) {
            this.context.fillStyle = backgroundColor;
            this.context.moveTo(offsetX, offsetY);
            this.context.fillRect(offsetX, offsetY, width, lineHeight);
        }
        let dY = offsetY + baselineOffset;

        if (underlineParams) {
            this.context.beginPath();
            this.context.lineWidth = 2;
            this.context.strokeStyle = '#000';
            this.context.moveTo(offsetX, offsetY + lineHeight);
            this.context.lineTo(offsetX + width, offsetY + lineHeight);
            this.context.stroke();
            this.context.lineWidth = 1;
        }
        this.context.strokeStyle = '#f00';
        this.context.fillText(text, offsetX, dY);
        this.context.strokeText(text, offsetX, dY);
        return width;
    }
}


export {
    TextRender
}