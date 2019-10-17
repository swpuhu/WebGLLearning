import Filter from './filter.js';
import Enum_Effect from './Enum/effectType.js';

const width = 640;
const height = 360;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

const filter = Filter(canvas);
const effectList = [];
filter.setEffectList(effectList);
const UI = document.createElement('div');
const select = document.createElement('select');
const list = document.createElement('div');
list.classList.add('effect-list');
const addBtn = document.createElement('button');
const delBtn = document.createElement('button');
addBtn.textContent = '添加特效';
delBtn .textContent = '删除特效';

const keys = Object.keys(Enum_Effect);

for (let i = 0; i < keys.length; i++) {
    let option = document.createElement('option');
    option.textContent = Enum_Effect[keys[i]];
    select.appendChild(option);
}

UI.appendChild(select);
// UI.appendChild(list);
// UI.appendChild(addBtn);
// UI.appendChild(delBtn);
document.body.appendChild(UI);

addBtn.onclick = function () {
    effectList.push(select.value);
    let li = document.createElement('div');
    li.classList.add('item');
    li.textContent = select.value;
    list.appendChild(li);
    li.index = effectList.length - 1;
    li.onclick = function () {
        if (li.classList.contains['active']) {
            li.classList.remove('active');
        } else {
            let sibling = li.parentElement.querySelectorAll('.item');
            sibling.forEach(item => {
                item.classList.remove('active');
            })
            li.classList.add('active');        
        }
    }
    video.paused && filter.render();
}

delBtn.onclick = function () {
    let selectedItem = list.querySelector('.active');
    if (selectedItem) {
        let index = Array.prototype.indexOf.call(list.children, selectedItem);
        effectList.splice(index, 1);
        selectedItem.remove();
    }
    video.paused && filter.render();
}


let currentUI;
select.onchange = function () {
    // filter.setEffectList([select.value]);
    // filter.render();
    effectList.length = 0;
    effectList.push(select.value);
    currentUI && currentUI.remove();
    if (window.effects[select.value].getElement) {
        currentUI = window.effects[select.value].getElement();
        UI.appendChild(currentUI);
    }
    video.paused && filter.render(video);
    
}


function loadImages(srcs) {
    let promises = [];
    for (let src of srcs) {
        let image = new Image();
        let p = new Promise((resolve, reject) => {
            image.onload = function () {
                resolve(image);
            }
            image.src = src;
        });
        promises.push(p);
    }
    return Promise.all(promises)
}

// loadImages(['../assets/gaoda1.jpg'])
// .then(([img]) => {
//     filter.setEffectList([select.value]);
//     filter.render(img);
// })

let video = document.createElement('video');
video.src = '../assets/popcart.mp4';
video.oncanplaythrough = function () {
    filter.render(video);
}


let playId;
function play() {
    video.paused && video.play();
    filter.render();
    playId = requestAnimationFrame(play);
}


function pause() {
    cancelAnimationFrame(playId);
    video.pause();
}

window.addEventListener('keydown', function (e) {
    if (e.code === 'Space') {
        if (video.paused) {
            play();
        } else {
            pause();
        }
    }3
})