import { Entity, Layer } from "../../../entities.js";
import components from '../components.js';

function createEntity(name, setters={}, layer=false) {
    let entity = new (layer ? Layer : Entity)(name);
 
    Object.keys(setters).forEach(attr => {

        let setAttr = 'set' + attr.charAt(0).toUpperCase() + attr.slice(1);
        let args = setters[attr];

        if (!Array.isArray(args)) {
            args = [args];
        }

        entity[setAttr](...args);
    });

    return entity;
}

function createSubLayer(name, layer, setters={}) {
    setters.layer = layer;
    setters.size = layer.size;

    return createEntity(name, setters, true);
}

export default {
    createEntity,
    createSubLayer,

    addImageSprite: (name, image, setters={}) => {
        let entity = createEntity(name, setters);

        components.addImage(entity, image);
        return entity;
    },

    addShapesLayer: (name, parentLayer, color, setters={}) => {
        let layer = createSubLayer(name, parentLayer, setters);

        components.addShapeGraphics(layer, color);
        return layer;
    },

    addTextSprite: (name, font, setters={}) => {
        let entity = createEntity(name, setters);

        components.addTextGraphics(entity, font);
        return entity;
    }
}