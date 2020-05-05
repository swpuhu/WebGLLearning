import { checkAndLoadFont } from './FontLoader.js';

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
            style[key] = value.trim();
        }
    }
    return style;
}

function DFSHTML (html, handler) {

    if (!html.innerHTML) return html.textContent;
    let obj = {
        styles: {},
        children: []
    };
    handler && handler(html);
    for (let i = 0; i < html.childNodes.length; i++) {
        if (html.childNodes.length) {
            let res = DFSHTML(html.childNodes[i], handler);
            if (html.childNodes[i] instanceof Text === false) {
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

window.dfs = DFSHTML;
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
        // let parser = new DOMParser();
        // html = html.trim();
        // html = parser.parseFromString(html, 'text/html');
        let map = new Map();
        let maxFontSize = 0;
        let font = '';
        let currentFont = '';
        let json = DFSHTML(html, (item) => {
            if (item.style.fontFamily) {
                fontFamilies.add(item.style.fontFamily);
            }
            if (item.style.fontFamily) {
                currentFont = item.style.fontFamily;
            }
            if (item.style.fontSize) {
                if (parseInt(item.style.fontSize) === maxFontSize) {
                    let maxFontFamily = map.get(maxFontSize);
                    let maxContentHeight = this._getBaselineOffset(maxFontFamily, maxFontSize)[1];
                    let currentContentHeight = this._getBaselineOffset(currentFont, maxFontSize)[1];
                    if (currentContentHeight > maxContentHeight) {
                        map.set(maxFontSize, currentFont);
                        font = currentFont;
                    }
                } else if (parseInt(item.style.fontSize) > maxFontSize) {
                    maxFontSize = parseInt(item.style.fontSize);
                    font = currentFont;
                    map.set(maxFontSize, font);
                }
            }
        });
        return [fontFamilies, json, maxFontSize, font];
    }

    drawHTML(html) {
        let [fontFamilies, json, maxFontSize, font] = this._analyze(html);
        let [baselineOffset, lineHeightPx] = this._getBaselineOffset(font, maxFontSize);
        let promises = [];
        for (let fontFamily of fontFamilies) {
            let params = this.fonts.find(item => (item.familyName === fontFamily));
            if (params) {
                let url = params.filePath;
                promises.push(checkAndLoadFont(fontFamily, url));
            }
        }
        promises.all(() => {
            let currentStyle = {
                fontFamily: 'SimHei Regular',
                fontSize: 16,
                lineHeight: 0,
                fontStyle: 'normal',
                fontWeight: 'normal',
                textAlign: 'left',
                color: '#000',
            }
        });

        for (let i = 0; i < json.children.length; i++) {
            let row = json.children[i];
            this._drawOneLine(row, currentStyle, baselineOffset, lineHeightPx);
        }
    }

    _drawOneLine (line, style, baselineOffset, lineHeightPx) {
        let offsetX = 0;
        let drawChildren = (parent, current) => {
            if (current.children) {
                let style = { ...parent.styles, ...current.styles }
            } else {
                style = parent.styles;
                offsetX += this.context.measureText(current);
            }
            
        }
        
        if (line.children) {
            for (let i = 0; i < line.children.length; i++) {

            }
        } else {
            offsetX += this.context.measureText(line);
        }
    }

    _getBaselineOffset (font, fontSize, lineHeight) {
        let params = this.fonts.find(item => (item.fullName === font));
        let winAscent = params.winAscent;
        let winDescent = params.winDescent;
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
        } else if (useTypoMetrics) {
            offsetY = halfLineHeight + contentHeight * typoAscent / (typoAscent + typoDescent);
        } else {
            offsetY = halfLineHeight + contentHeight * winAscent / (winAscent + winDescent);
        }
        return [offsetY, lineHeightPx];

    }


    drawText (text, fontFamily = 'SimHei Regular', fontSize = 16, lineHeight = 0, fontStyle = 'normal', fontWeight = 'normal', textAlign = 'left', width = 100, height = 100, color = '#000', backgroundColor, shadowColor, url) {

        let params = this.fonts.find(item => ((item.familyName + ' ' + item.styleName) === fontFamily));
        url = params.filePath;
        checkAndLoadFont(fontFamily, url).then(async (e) => {
            if (e && e.code === 0 || e.code === 1) {
                this.context.clearRect(0, 0, width, height);
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
                this.context.fillStyle = color;

                let winAscent = params.winAscent;
                let winDescent = params.winDescent;
                let typoAscent = params.typoAscent;
                let typoDescent = -params.typoDescent;
                let HHAscent = params.HHAscent;
                let HHDescent = -params.HHDescent;
                let unitsPerEm = params.unitsPerEM;
                let useTypoMetrics = params.useTypoMetrics;
                fontSize = Math.floor(fontSize);
                let coefficient;
                if (useTypoMetrics) {
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
                if (useTypoMetrics) {
                    offsetY = halfLineHeight + contentHeight * typoAscent / (typoAscent + typoDescent);
                } else {
                    offsetY = halfLineHeight + contentHeight * winAscent / (winAscent + winDescent);
                }
                let offsetX = 0;
                if (textAlign === 'left') {
                    offsetX = 0;
                    this.context.direction = 'ltr';
                } else if (textAlign === 'center') {
                    offsetX = width / 2;
                    this.context.direction = 'ltr';
                } else {
                    offsetX = width;
                    this.context.direction = 'rtl';
                }
                this._draw(text, offsetX, offsetY, lineHeightPx, width);
            }
        });
    }

    _draw (text, offsetX, offsetY, lineHeightPx, lineNums) {
        let dY = lineNums * lineHeightPx + offsetY;
        this.context.fillText(text, offsetX, dY);
        i++;
    }
}


export {
    TextRender
}