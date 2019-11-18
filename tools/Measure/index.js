import MeasureUI from './MeasureUI.js';
import MessageUI from './Message.js';
function Measure(content) {
    let obj = {};
    const wrapper = document.createElement('div');
    wrapper.classList.add('measure-wrapper');
    wrapper.classList.add('relative')
    const canvas = document.createElement('canvas');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', content.offsetWidth);
    svg.setAttribute('height', content.offsetHeight);
    const context = canvas.getContext('2d');
    const styles = {
        point: {
            size: 3,
            fill: '#0885ee'
        },
        line: {
            size: 3,
            fill: '#08eeff',
            stroke: '#08eeee',
            strokeWidth: 2,
        }
    }
    const controlUI = MeasureUI(styles);
    const messageUI = MessageUI();


    canvas.style.position = 'absolute';
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.width = content.offsetWidth;
    canvas.height = content.offsetHeight;

    svg.style.position = 'absolute';
    svg.style.left = 0;
    svg.style.top = 0;

    wrapper.appendChild(content);
    wrapper.appendChild(canvas);
    wrapper.appendChild(svg);
    document.body.appendChild(wrapper);



    function createPoint(x, y, type = 'point') {
        let point = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        let obj = {};
        let currentX = x;
        let currentY = y;
        point.setAttribute('cx', currentX);
        point.setAttribute('cy', currentY);
        point.setAttribute('r', styles[type].size);
        point.setAttribute('fill', styles[type].fill);
        point.onmouseenter = function () {
            point.setAttribute('r', styles[type].size * 1.5);
        }
        point.onmouseleave = function () {
            point.setAttribute('r', styles[type].size);
        }
        point.onmousedown = function (e) {
            if (e.target === point) {
                e.stopPropagation();
            }
        }
        if (type === 'point') {
            point.onmousedown = function (e) {
                svg.addEventListener('mousemove', mousemove);
                svg.addEventListener('mouseup', mouseup);

                function mousemove(ev) {
                    updatePosition(ev.offsetX, ev.offsetY);
                }

                function mouseup() {
                    svg.removeEventListener('mousemove', mousemove);
                    svg.removeEventListener('mouseup', mouseup);
                }
            }
        }
        function updatePosition(x, y) {
            currentX = x;
            currentY = y;
            point.setAttribute('cx', x);
            point.setAttribute('cy', y);
        }
        obj.updatePosition = updatePosition;
        obj.ref = point;
        Object.defineProperties(obj, {
            position: {
                get() {
                    return [currentX, currentY];
                }
            }
        })
        return obj;
    }

    function createLine(x1, y1, x2, y2) {
        let obj = {};
        let currentX1 = x1;
        let currentY1 = y1;
        let currentX2 = x2;
        let currentY2 = y2;
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        let p1 = Object.create(createPoint(currentX1, currentY1, 'line'));
        let p2 = Object.create(createPoint(currentX2, currentY2, 'line'));

        p1.updatePosition = function (x, y) {
            if (controlUI.currentUI !== controlUI.selectUI) {
                return;
            }
            currentX1 = x;
            currentY1 = y;
            p1.__proto__.updatePosition(x, y);
            line.setAttribute('x1', x);
            line.setAttribute('y1', y);
        }

        p2.updatePosition = function (x, y) {
            currentX2 = x;
            currentY2 = y;
            p2.__proto__.updatePosition(x, y);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
        }

        function pointMouseDown(e) {
            let that = this;
            svg.addEventListener('mousemove', pointMouseMove);
            svg.addEventListener('mouseup', pointMouseUp);
            let startX = e.clientX;
            let startY = e.clientY;
            let [x, y] = that.position;
            function pointMouseMove(ev) {
                let offsetX = ev.clientX - startX;
                let offsetY = ev.clientY - startY;
                that.updatePosition(x + offsetX, y + offsetY);
            }

            function pointMouseUp() {
                svg.removeEventListener('mousemove', pointMouseMove);
                svg.removeEventListener('mouseup', pointMouseUp);

            }

        }

        function lineMouseDown(e) {

            if (controlUI.currentUI !== controlUI.selectUI) {
                return;
            }
            let that = this;
            svg.addEventListener('mousemove', lineMouseMove);
            svg.addEventListener('mouseup', lineMouseUp);
            let startX = e.clientX;
            let startY = e.clientY;
            let [x1, y1, x2, y2] = [currentX1, currentY1, currentX2, currentY2];
            function lineMouseMove(ev) {
                let offsetX = ev.clientX - startX;
                let offsetY = ev.clientY - startY;
                updatePosition(x1 + offsetX, y1 + offsetY, x2 + offsetX, y2 + offsetY);
            }

            function lineMouseUp() {
                svg.removeEventListener('mousemove', lineMouseMove);
                svg.removeEventListener('mouseup', lineMouseUp);

            }

        }


        p1.ref.addEventListener('mousedown', pointMouseDown.bind(p1));
        p2.ref.addEventListener('mousedown', pointMouseDown.bind(p2));
        line.addEventListener('mousedown', lineMouseDown);
        group.appendChild(p1.ref);
        group.appendChild(p2.ref);
        group.appendChild(line);
        line.setAttribute('x1', currentX1);
        line.setAttribute('y1', currentY1);
        line.setAttribute('x2', currentX2);
        line.setAttribute('y2', currentY2);
        line.setAttribute('stroke-width', styles.line.strokeWidth);
        line.setAttribute('fill', styles.line.fill);
        line.setAttribute('stroke', styles.line.stroke);
        line.onmouseenter = function () {
            line.setAttribute('stroke-width', styles.line.strokeWidth * 1.5);
        }
        line.onmouseleave = function () {
            line.setAttribute('stroke-width', styles.line.strokeWidth);
        }
        function updatePosition(x1, y1, x2, y2) {
            currentX1 = x1;
            currentY1 = y1;
            currentX2 = x2;
            currentY2 = y2;
            p1.updatePosition(currentX1, currentY1);
            p2.updatePosition(currentX2, currentY2);
            line.setAttribute('x1', currentX1);
            line.setAttribute('y1', currentY1);
            line.setAttribute('x2', currentX2);
            line.setAttribute('y2', currentY2);
        }
        obj.updatePosition = updatePosition;
        obj.ref = group;
        Object.defineProperties(obj, {
            position: {
                get() {
                    return [currentX1, currentY1, currentX2, currentY2];
                }
            }
        })
        return obj;


    }



    controlUI.pointUI.click = function (e) {
        let x = e.offsetX;
        let y = e.offsetY;
        let point = createPoint(x, y);
        svg.appendChild(point.ref);

    }

    controlUI.lineUI.mousedown = function (e) {
        let x1 = e.offsetX;
        let y1 = e.offsetY;
        let line = createLine(x1, y1, x1, y1);
        svg.appendChild(line.ref);
        function mousemove(ev) {
            let x2 = ev.offsetX;
            let y2 = ev.offsetY;
            line.updatePosition(x1, y1, x2, y2);
        }
        function mouseup() {
            svg.removeEventListener('mousemove', mousemove);
            svg.removeEventListener('mouseup', mouseup);
        }

        svg.addEventListener('mousemove', mousemove);
        svg.addEventListener('mouseup', mouseup);
    }

    controlUI.selectUI.click = function (e) {
        let tagName = e.target.tagName;
        let target = e.target;
        let title = '--';
        let infos = [];
        if (tagName === 'circle') {
            title = '点';
            let x = target.getAttribute('cx');
            let y = target.getAttribute('cy');
            infos = [
                {
                    title: 'X坐标',
                    content: x
                },
                {
                    title: 'Y坐标',
                    content: y
                }
            ]

        } else if (tagName === 'line') {
            title = '线段';
            let x1 = target.getAttribute('x1');
            let y1 = target.getAttribute('y1');
            let x2 = target.getAttribute('x2');
            let y2 = target.getAttribute('y2');
            infos = [
                {
                    title: '起始点X1坐标',
                    content: x1
                },
                {
                    title: '起始点Y1坐标',
                    content: y1
                },
                {
                    title: '起始点X2坐标',
                    content: x2
                },
                {
                    title: '起始点Y2坐标',
                    content: y2
                },
                {
                    title: '线段长度',
                    content: ~~(Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2))
                }
            ];
        }
        messageUI.entityInfo.showInfo(title, infos);
    }



    svg.addEventListener('click', function (e) {
        controlUI.currentUI && controlUI.currentUI.click && controlUI.currentUI.click(e);
    });

    svg.addEventListener('mousedown', function (e) {
        controlUI.currentUI && controlUI.currentUI.mousedown && controlUI.currentUI.mousedown(e);
    });


    svg.addEventListener('mousemove', function (e) {
        messageUI.position.updatePosition(e.offsetX, e.offsetY);
    })
    obj.controlUI = controlUI.ref;
    obj.messageUI = messageUI.ref

    return obj;
}


export default Measure;