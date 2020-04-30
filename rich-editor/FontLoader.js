function loadFont (fontFamily, url) {
    return new Promise((resolve, reject) => {
        if (fontFamily === 'Microsoft YaHei') {
            resolve({ code: 1 });
            return;
        }
        let font = new FontFace(fontFamily, `url(${url})`);
        font.load().then(() => {
            document.fonts.add(font);
            resolve();
        }).catch(reject);
    })
}

function checkAndLoadFont (name, url = '') {
    return new Promise((resolve, reject) => {
        let values = document.fonts.values();
        let isHave = false;
        let item = values.next();
        while (!item.done && !isHave) {
            let fontFace = item.value;
            if (fontFace.family === name) {
                isHave = true;
                if (fontFace.status === 'loaded') {
                    resolve({ code: 1 });
                } else {
                    fontFace.loaded.then(resolve);
                    fontFace.load();
                }
            }
            item = values.next();
        }

        if (!isHave) {
            loadFont(name, url)
                .then(() => resolve({ code: 0 }))
                .catch(() => reject({ code: -1 }));
        }
    })
}

export {
    checkAndLoadFont
}