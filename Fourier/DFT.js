class Complex {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }
}

/**
 * 
 * @param {Complex} a 
 * @param {Complex} b 
 */
function complexAdd(a, b) {
    let ret = new Complex();
    ret.re = a.re + b.re;
    ret.im = a.im + b.im;
    return ret;
}

/**
 * 
 * @param {Complex} a 
 * @param {Complex} b 
 */
function complexMulti(a, b) {
    let ret = new Complex();
    ret.re = a.re * b.re - a.im * b.im;
    ret.im = a.im * b.re + a.re * b.im;
    return ret;
}

function DFT(x, N) {
    let wnk = new Complex();
    let X = new Array(N);
    for (let k = 0; k < N; k++) {
        X[k] = new Complex(0, 0);
        for (let n = 0; n < N; n++) {
            wnk.re = Math.cos(2 * Math.PI * k * n / N);
            wnk.im = -Math.sin(2 * Math.PI * k * n / N);
            X[k] = complexAdd(X[k], complexMulti(x[n], wnk));
        }
    }
    return X;
}


function IDFT(X, N) {
    let ejw = new Complex();
    let x = new Array(N);
    for (let k = 0; k < N; k++) {
        x[k] = new Complex(0, 0);
        for (let n = 0; n < N; n++) {
            ejw.re = Math.cos(2 * Math.PI * k * n / N);
            ejw.im = Math.sin(2 * Math.PI * k * n / N);
            x[k] = complexAdd(x[k], complexMulti(X[n], ejw));
        }
        x[k].re /= N;
        x[k].im /= N;
    }
    return x;
}



// let samples = [];
// let n = 90;
// for (let i = 0; i < n; i++) {
//     let complex = new Complex(Math.sin(10 * Math.PI * i * Math.PI / 180), 0);
//     samples.push(complex);
// }
// let X = DFT(samples, n);
// console.log(X);