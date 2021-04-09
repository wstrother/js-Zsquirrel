import { CollisionSystem } from './collisionSystem.js';
import methods from './methods.js';

function getCollisionSystem(getEntities, callback, getTargets=false) {
    let callback = getCallback(check, adjust);

    if (!getTargets) {
        return () => testCollisionsInGroup(getEntities, callback);
    
    } else {
        return () => getTargets().forEach(
            target => testCollisionsWithGroup(target, getEntities, callback));
    }
}

function testCollisionsWithGroup(target, getOthers, callback) {
    getOthers().forEach(other => {
        callback(target, other);
    });
}

function testCollisionsInGroup(getEntities, callback) {
    let tested = [];

    getEntities().forEach(entity => {
        tested.push(entity);

        testCollisionsWithGroup(
            entity,
            () => getEntities().filter(e => !tested.includes(e)),
            callback
        );
    });
}


function getCallback(check, adjust, onEvent=false) {
    return (obj1, obj2) => {
        let result = check(obj1, obj2);
    
        if (result) {
            if (onEvent) {
                onEvent(
                    adjust(obj1, obj2, result)
                );
            } else {
                adjust(obj1, obj2, result);
            }
        }
    }
}



export default {
    collisionRectSystem: (layer) => {
        return getCallback(
            methods.checkRectVsWall,
            methods.adjustRectVsWall,
            (adjustment) => layer.events.emit('collision')
        )


    },

    addCollisionSystem: (layer, callback, getEntities, getTargets=false) => {
        layer.addComponent('collisions', new CollisionSystem(layer));

        layer.collisions.run = getCollisionSystem(
            getEntities,
            callback,
            getTargets
        );
    }
}