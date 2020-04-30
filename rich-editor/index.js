import {RichEditor} from './RichEditor.js';
import {TextRender} from './TextRender.js';
let container = document.getElementById('editor');
let canvas = document.getElementById('canvas');

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
}())
