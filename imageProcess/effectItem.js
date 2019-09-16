/**
 * 
 * @param {string} name 
 * @param {string} type 
 */

function EffectItem (name, type, params) {
    const obj = {};
    obj.type = type;
    obj.params = params;
    const doc = document.createElement('div');
    doc.classList.add('effect-item');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('item-name');
    nameDiv.textContent = name;

    doc.appendChild(nameDiv);
    Object.defineProperties(obj, {
        ref: {
            get () {
                return doc;
            }
        }
    });

    return obj;
}

export default EffectItem;