import {RichEditor} from './RichEditor.js';
import {TextRender} from './TextRender.js';
import {TrueTypeFont} from './TrueTypeFont.js';
let container = document.getElementById('editor');
let canvas = document.getElementById('canvas');
window.assert = function (bool) {
    if (!bool) {
        throw new Error('');
    }
}
function ajax (url, method = 'GET') {
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState === this.DONE) {
                if (this.status === 200 || this.status === 304 || this.status === 206) {
                    let responseType = this.getResponseHeader('Content-Type');
                    if (/application\/json/.test(responseType)) {
                        resolve(JSON.parse(this.responseText));
                    } else {
                        resolve(this.responseText); s
                    }
                }
            }
        }
        xhr.open(method, url);
        xhr.send(null);
    })
}

(async function () {

    let fontData = await ajax('/getFont');
    window.fontData = fontData;
    let editor = new RichEditor(container, fontData, true);
    
    let renderer = new TextRender(canvas, fontData);
    window.renderer = renderer;
    let button = document.createElement('button');
    button.textContent = 'Render';
    button.onclick = function () {
        renderer.drawText(editor.getHtml().trim());
    }

    editor.onchange = () => {
    }
    window.editor = editor;
    document.body.appendChild(editor.ui);
    document.body.appendChild(button);

    let inputFile = document.getElementById('read-file');
    inputFile.onchange = function (e) {
        e.preventDefault();
        let reader = new FileReader();
        reader.readAsArrayBuffer(inputFile.files[0]);
        reader.onload = function () {
            let font = new TrueTypeFont(this.result);
            console.log(font);
        }
    }
}())
