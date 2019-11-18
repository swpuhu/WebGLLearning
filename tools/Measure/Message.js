export default function () {
    let doc = document.createElement('div');
    let obj = {};
    doc.classList.add('measure-message');

    function Position () {
        let positionObj = {};
        let position = document.createElement('div');
        let positionTitle = document.createElement('div');
        positionTitle.textContent = '当前位置';
    
        let xPosition = document.createElement('div');
        xPosition.classList.add('position');
        let xPositionTitle = document.createElement('div');
        xPositionTitle.classList.add('position-title');
        xPositionTitle.textContent = 'x';
        let xPositionCoord = document.createElement('div');
        xPositionCoord.classList.add('position-coord');
        xPositionCoord.textContent = '--';
        xPosition.appendChild(xPositionTitle);
        xPosition.appendChild(xPositionCoord);
        
        let yPosition = document.createElement('div');
        yPosition.classList.add('position');
        let yPositionTitle = document.createElement('div');
        yPositionTitle.classList.add('position-title');
        yPositionTitle.textContent = 'y';
        let yPositionCoord = document.createElement('div');
        yPositionCoord.classList.add('position-coord');
        yPositionCoord.textContent = '--';
        yPosition.appendChild(yPositionTitle);
        yPosition.appendChild(yPositionCoord);
    
        position.appendChild(positionTitle);
        position.appendChild(xPosition);
        position.appendChild(yPosition);
    
        position.classList.add('message-position');


        function updatePosition(x, y) {
            xPositionCoord.textContent = x;
            yPositionCoord.textContent = y;
        }


        positionObj.ref = position;
        positionObj.updatePosition = updatePosition;
        return positionObj;
    }

    
    function EntityInfo() {
        let entityObj = {};
        let entityInfo = document.createElement('div');
        entityInfo.classList.add('message-entityinfo');
        
        let infoTitle = document.createElement('div');
        infoTitle.classList.add('entity-title');
        infoTitle.textContent = '--';

        let infoBody = document.createElement('div');
        infoBody.classList.add('entity-body');
        entityInfo.appendChild(infoTitle);
        entityInfo.appendChild(infoBody);

        /**
         * 
         * @param {Array} infos
         */
        function showInfo(title, infos) {
            let frag = document.createDocumentFragment();
            infoBody.innerHTML = '';
            infos.forEach(info => {
                let item = document.createElement('div');
                item.classList.add('entity-item');
                let title = document.createElement('div');
                title.classList.add('entity-item__title');
                title.textContent = info.title;
                let content = document.createElement('div');
                content.classList.add('entity-item__content');
                content.textContent = info.content;
                item.appendChild(title);
                item.appendChild(content);
                frag.appendChild(item);
            });
            infoTitle.textContent = title;
            infoBody.appendChild(frag);
        }


        Object.defineProperties(entityObj, {
            ref: {
                value: entityInfo
            },
            showInfo: {
                value: showInfo
            }
        });
        return entityObj;
    }

    let position = Position();
    let entityInfo = EntityInfo();
    doc.appendChild(position.ref);
    doc.appendChild(entityInfo.ref);



    obj.ref = doc;
    obj.position = position;
    obj.entityInfo = entityInfo;
    return obj;
}