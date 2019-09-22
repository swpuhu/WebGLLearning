import Filter from './filter.js';
import Enum_Effect from './Enum/effectType.js';

const width = 640;
const height = 360;
const canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

const filter = Filter(canvas);
const UI = document.createElement('div');
const select = document.createElement('select');
const keys = Object.keys(Enum_Effect);

for (let i = 0; i < keys.length; i++) {
    let option = document.createElement('option');
    option.textContent = Enum_Effect[keys[i]];
    select.appendChild(option);
}

UI.appendChild(select);
document.body.appendChild(UI);

select.onchange = function () {

    filter.setEffectList([select.value]);
    filter.render();
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
video.src = '../assets/ad1.mp4';
video.oncanplaythrough = function () {
    filter.setEffectList([select.value]);
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
    }
})