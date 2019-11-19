
const test = '3 +182 * 2';

class Token {
    constructor (type, value) {
        this.type = type;
        this.value = value;
    }
}

class Tokens {
    constructor () {
        this.tokens = [];
    }

    push(value) {
        this.tokens.push(value);
    }

    read() {
        return this.tokens.shift();
    }

    peek() {
        return this.tokens[0];
    }
}


class ASTNode {
    constructor (token) {
        this.type = token.type;
        this.value = token.value;
        this.left = null;
        this.right = null;
    }

    add(value) {
        if (value instanceof ASTNode !== true) {
            throw new Error('not ASTNode Type value');
        }
        if (!this.left) {
            this.left = value;
        } else if (!this.right) {
            this.right = value;
        } else {
            throw new Error('cannot add child in this node.');
        }
    }
}

function isDigital(value) {
    return /[0-9]/.test(value);
}

function isBlank(value) {
    return /\s/.test(value);
}

let STATE = {
    number: 'number',
    add: 'add',
    minus: 'minus',
    multi: 'multi',
    divide: 'divide',
    blank: 'blank',
    other: 'other'
}



function DFA(str) {
    let tokens = new Tokens();
    let current = '';
    let state = init();
    function init() {
        let state;
        let c = str[0];
        if (isDigital(c)) {
            state = STATE.number;
        } else if ('+' === c) {
            state = STATE.add;
        } else if ('-' === c) {
            state = STATE.minus;
        } else if ('*' === c) {
            state = STATE.multi;
        } else if ('/' === c) {
            state = STATE.divide;
        } else if (isBlank(c)) {
            state = STATE.blank;
        } else {
            state = STATE.other;
        }
        current = c;
        return state;
    }
    
    function stateTransfer(c) {
        if (state === STATE.number) {
            if (isBlank(c)) {
                let token = new Token(STATE.number, current);
                current = '';
                tokens.push(token);
                state = STATE.blank;
            } else if (c === '+') {
                let token = new Token(STATE.number, current);
                current = '+';
                tokens.push(token);
                state = STATE.add;
            } else if (c === '-') {
                let token = new Token(STATE.number, current);
                current = '-';
                tokens.push(token);
                state = STATE.minus;
            } else if (c === '*') {
                let token = new Token(STATE.number, current);
                current = '*';
                tokens.push(token);
                state = STATE.multi;
            } else if (c === '/') {
                let token = new Token(STATE.number, current);
                current = '/';
                tokens.push(token);
                state = STATE.divide;
            } else if (isDigital(c)) {
                current += c;
            } else {
                current += c;
                state = STATE.other;
            }
        } else if (state === STATE.add || state === STATE.minus || state === STATE.multi || state === STATE.divide) {
            if (isBlank(c)) {
                let token = new Token(state, current);
                current = '';
                tokens.push(token);
                state = STATE.blank;
            } else if (isDigital(c)) {
                let token = new Token(state, current);
                current = c;
                tokens.push(token);
                state = STATE.number;
            } else {
                current += c;
                state = STATE.other;
            }
        }else if (state === STATE.blank) {
            if (isDigital(c)) {
                state = STATE.number;
                current = c;
            } else if ('+' === c) {
                state = STATE.add;
                current = c;
            } else if ('-' === c) {
                state = STATE.minus;
                current = c;
            } else if ('*' === c) {
                state = STATE.multi;
                current = c;
            } else if ('/' === c) {
                state = STATE.divide;
                current = c;
            } else if (isBlank(c)) {
                
            } else {
                state = STATE.other;
                current = c;
            }
        } else if (state === STATE.other) {
            if (isBlank(c)) {
                state = STATE.blank;
                current = c;
            } else {
                current += c;
            }
        }
    }
    for (let i = 1; i < str.length; i++) {
        stateTransfer(str[i]);
    }
    if (current !== '') {
        let token = new Token(state, current);
        tokens.push(token);
    }
    return tokens;
}


function additive(tokens) {
    function multiplicative (tokens) {
        let token = tokens.read();
        let child1 = new ASTNode(token);
        let node = child1;
        token = tokens.peek();
        if (token && child1) {
            if (token.type === STATE.multi) {
                token = tokens.read();
                let child2 = multiplicative(tokens);
                if (child2) {
                    node = new ASTNode(new Token(STATE.multi, token.value));
                    node.add(child1);
                    node.add(child2);
                }
            }
        }
        return node;
    }

    let child1 = multiplicative(tokens);
    let node = child1;
    let token = tokens.peek();
    if (token && child1) {
        if (token.type === STATE.add) {
            token = tokens.read();
            let child2 = additive(tokens);
            if (child2) {
                node = new ASTNode(new Token(STATE.add, token.value));
                node.add(child1);
                node.add(child2);
            } else {
                throw new Error('invalid additive expression.');
            }
        }
    }
    return node;
}




// let tokens = DFA(test);

// let node = additive(tokens);
// console.log(node);


export default function (str) {
    let tokens = DFA(str);zz
    let node = additive(tokens);
    return node;
}