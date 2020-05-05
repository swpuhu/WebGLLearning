import { checkAndLoadFont } from './FontLoader.js';

class RichEditor {
    /**
     * 
     * @param {HTMLElement} container 
     */
    constructor (container, fonts, showUI = false) {
        this.container = container;
        this.fonts = fonts;
        let editable = container.getAttribute('contenteditable');
        this.onchange;
        this.container.addEventListener('input', () => {
            this.onchange && this.onchange();
        })
        
        console.log(editable);
        document.execCommand('styleWithCSS', false, true);
        if (showUI) {
            this.ui = this._createUI();
        }
    }
    hasSelection () {
        return document.getSelection().rangeCount > 0;
    }
    setBold () {
        if (this.hasSelection()) {
            document.execCommand('bold', false);
        } else {

        }
    }

    setItalic () {
        if (this.hasSelection()) {
            document.execCommand('italic', false);
        } else {

        }
    }

    setForeColor (color, selection) {
        if (selection) {
            this.resetSelection(...selection)
            document.execCommand('foreColor', false, color);
        } else if (this.hasSelection()) {
            document.execCommand('foreColor', false, color);
        } else {

        }
    }

    setBackColor (color, selection) {
         if (selection) {
            this.resetSelection(...selection)
            document.execCommand('foreColor', false, color);
        } else if (this.hasSelection()) {
            document.execCommand('backColor', false, color);
        } else {

        }
    }

    setFontSize (size, selection) {
        if (selection) {
            this.resetSelection(...selection)
        }
        if (this.hasSelection()) {
            document.execCommand('fontSize', false, 10);
            let allSpan = this.container.querySelectorAll('span');
            allSpan.forEach(item => {
                if (item.style.fontSize === 'xxx-large') {
                    item.style.fontSize = size + 'px';
                }
            })
        } else {

        }
    }

    setFontFamily (fontFamily) {
        let font = this.fonts.find(item => item.fullName === fontFamily);
        if (font) {
            checkAndLoadFont(fontFamily, font.filePath)
                .then(() => {
                    document.execCommand('fontName', false, fontFamily);
                })

        }
    }

    getSelection () {
        let selection = document.getSelection();
        let count = selection.rangeCount;
        if (count < 1) {
            return [];
        }
        let range = selection.getRangeAt(0);
        return [range.startContainer, range.endContainer, range.startOffset, range.endOffset];
    }


    _createUI () {
        let container = document.createElement('div');
        let bold = document.createElement('button');
        bold.textContent = 'B';
        bold.onclick = () => {
            this.setBold();
        }
        let italic = document.createElement('button');
        italic.textContent = 'I';
        italic.onclick = () => {
            this.setItalic();
        }
        let fontSize = document.createElement('input');
        fontSize.min = 12;
        fontSize.max = 100;
        fontSize.step = 1;
        let selections;
        fontSize.onmousedown = () => {
            selections = this.getSelection();
        }
        fontSize.onchange = () => {
            this.resetSelection(...selections);
            this.setFontSize(fontSize.value);
        }

        let fontFamily = document.createElement('select');
        for (let font of window.fontData) {
            let option = document.createElement('option');
            option.value = font.fullName;
            option.textContent = font.fullName;
            fontFamily.appendChild(option);
        }
        fontFamily.onchange = () => {
            this.setFontFamily(fontFamily.value);
        }
        
        container.appendChild(bold);
        container.appendChild(italic);
        container.appendChild(fontSize);
        container.appendChild(fontFamily);
        return container;
    }

    resetSelection (startContainer, endContainer, startOffset, endOffset) {
        let selection = window.getSelection();
        selection.removeAllRanges();
        let range = document.createRange();
        range.setStart(startContainer, startOffset);
        range.setEnd(endContainer, endOffset);
        selection.addRange(range);
    }

    getHtml() {
        return this.container;
    }
}

export {RichEditor};