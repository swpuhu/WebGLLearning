export default function (styles) {

    let obj = {};
    let doc = document.createElement('div');
    let UIs = [];
    doc.classList.add('measure-toolbar');

    let drawToolbar = document.createElement('div');
    drawToolbar.classList.add('toolbar-draw');
    let drawToolbarTitle = document.createElement('div');
    drawToolbarTitle.classList.add('toolbar-draw__title')
    let drawToolbarWrapper = document.createElement('div');
    drawToolbarWrapper.classList.add('toolbar-draw__wrapper');
    document.onselectstart = function (e) {
        e.preventDefault();
    }

    drawToolbarTitle.textContent = '绘制工具';
    drawToolbar.appendChild(drawToolbarTitle);
    drawToolbar.appendChild(drawToolbarWrapper);

    let currentUI;
    function createButton(name) {
        let obj = {};
        let pointUI = document.createElement('div');
        pointUI.textContent = name;
        pointUI.classList.add('toolbar-icon');
        pointUI.onclick = function () {
            currentUI = obj;
            UIs.forEach(item => item.ref.classList.remove('active'));
            pointUI.classList.add('active');
        }
        UIs.push(obj);
        drawToolbarWrapper.appendChild(pointUI);
        obj.ref = pointUI;
        return obj;
    }


    let selectUI = createButton('选择');
    let pointUI = createButton('点');
    let lineUI = createButton('线');
    doc.appendChild(drawToolbar);


    Object.defineProperties(obj, {
        currentUI: {
            get() {
                return currentUI;
            }
        },
        pointUI: {
            value: pointUI
        },
        lineUI: {
            value: lineUI
        },
        selectUI: {
            value: selectUI
        },
        ref: {
            value: doc
        }
    })
    return obj;

}