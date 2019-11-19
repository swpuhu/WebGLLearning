import VisulizeTree from './visulizeTree.js';
import Analyser from './cifa.js';

let str = '3 + 8 * 2 * 92 + 30 * 100 + 27*20';
let startTime = performance.now();
let tree = Analyser(str);
console.log(performance.now() - startTime);
console.log(str);
console.log(tree);
let treeDOM = new VisulizeTree(tree);
document.body.appendChild(treeDOM.ref);
// console.log(treeDOM.ref);