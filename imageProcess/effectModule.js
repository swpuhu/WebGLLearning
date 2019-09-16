
import EffectItem from './effectItem.js';

const wrapper = document.createElement('div');
wrapper.classList.add('main-wrapper');

const list = document.createElement('div');
list.classList.add('effect-list');

const panel = document.createElement('div');
panel.classList.add('panel');

wrapper.appendChild(list);
wrapper.appendChild(panel);

let effect_2d = EffectItem('2d', '2d');
let effect_mono = EffectItem('mono', 'mono');
let effect_negative = EffectItem('negative', 'negative');

list.appendChild(effect_2d.ref);
list.appendChild(effect_mono.ref);
list.appendChild(effect_negative.ref);



export default wrapper;