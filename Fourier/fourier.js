class Complex {
    constructor(re, im) {
        this.re = re;
        this.im = im;
    }
}

/**
 * 
 * @param {Complex} complex1 
 * @param {Complex} complex2 
 */
function complexAdd(complex1, complex2) {
    let re, im;
    re = complex1.re + complex2.re;
    im = complex1.im + complex2.im;
    return new Complex(re, im);
}

function complexMulti(complex1, complex2) {
    let re, im;
    re = complex1.re * complex2.re - complex1.im * complex2.im;
    im = complex1.re * complex2.im + complex1.im * complex2.re;
    return new Complex(re, im);
}

function DFT(x, N) {
    let X = new Array(N);
    let k, n;
    let wnk = new Complex(0, 0);
    for (k = 0; k < N; k++) {
        X[k] = new Complex(0, 0);
        for (n = 0; n < N; n++) {
            wnk.re = Math.cos(2 * Math.PI * k * n / N);
            wnk.im = -Math.sin(2 * Math.PI * k * n / N);
            X[k] = complexAdd(X[k], complexMulti(x[n], wnk));
        }
    }
    return X;
}


function IDFT(X, N) {
    let x = new Array(N);
    let k, n;
    let ejw = new Complex(0, 0);
    for (k = 0; k < N; k++) {
        x[k] = new Complex(0, 0);
        for (n = 0; n < N; n++) {
            ejw.re = Math.cos(2 * Math.PI * k * n / N);
            ejw.im = Math.sin(2 * Math.PI * k * n / N);
            x[k] = complexAdd(x[k], complexMulti(X[n], ejw));
            x[k].re /= N;
            x[k].im /= N;
        }
    }
    return x;
}
let x = [];
let n = 10;
for (let i = 1; i <= n; i++) {
    // let complex = new Complex(i * Math.PI / 180, 0);
    let complex = new Complex(i, 0);
    x.push(complex);
}
let X = DFT(x, n);
let ix = IDFT(x, n);
console.log(X);
console.log(ix);