const fs = require('fs');
const path = require('path');
const pwd = path.resolve(__dirname, '../../assets/fonts/')
fs.readdir(pwd, function (err, files) {
    for (let file of files) {
        let filepath = path.resolve(pwd, file);
        fs.stat(filepath, function(err, stats) {
            if (!err && stats.isFile()) {
                fs.readFile(filepath, function (err, data) {
                    if (!err) {
                        
                    }
                })
            }
        })
    }
})