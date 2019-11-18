function distance(x1, y1, x2, y2, x, y) {
    let k = (y1 - y2) / (x2 - x1);
    let b = y1 - k * x1;
    return (k * x - y + b) / (Math.sqrt(k ** 2 + 1));
}