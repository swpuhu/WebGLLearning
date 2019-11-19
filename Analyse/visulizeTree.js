export default class VisulizeTree {
    constructor (node) {
        let doc = this.traversal(node);
        doc.classList.add('container');
        this.ref = doc;
    }

    traversal(node) {
        let parent = document.createElement('div');
        let value = document.createElement('div');
        value.classList.add('value');
        value.textContent = node.value;
        parent.appendChild(value);
        let children = document.createElement('div');
        children.classList.add('children');
        children.classList.add('flex');
        if (node.left || node.right) {
            parent.appendChild(children);
        }
        
        if (!node.left && !node.right) {
            value.classList.add('leaf');
        }

        if (node.left) {
            let leaf = this.traversal(node.left);
            children.appendChild(leaf);
        }
        if (node.right) {
            let leaf = this.traversal(node.right);
            children.appendChild(leaf);
        }
        return parent;
    }
}