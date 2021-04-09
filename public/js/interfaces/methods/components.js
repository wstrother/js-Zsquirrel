import { Animator } from "../../animations/animation.js";
import { parseAnimation } from "../../animations/animationParser.js";
import { ImageGraphics, ShapeLayerGraphics, SpriteSheetGraphics, TextGraphics } from "../../graphics.js";
import { Physics } from "../../physics/physics.js";
import { StateMachine } from "../../states/stateMachine.js";
import { parseStateMachine } from "../../states/stateParser.js";

function addComponent(entity, name, compClass, compProperties, ...compArgs) {
    entity.addComponent(name, new compClass(entity, ...compArgs));
    Object.assign(entity[name], compProperties);
}

function replaceComponent(entity, name, compClass, compProperties, ...compArgs) {
    entity.addComponent(name, new compClass(entity, ...compArgs), true);
    Object.assign(entity[name], compProperties);
}

// graphics

function addGraphics(entity, ...args) {
    replaceComponent(entity, 'graphics', ...args);
}

function addSpriteSheet(entity, image) {
    addGraphics(entity, SpriteSheetGraphics, {}, image);
}


// states

function addStates(entity, state='default') {
    addComponent(entity, 'states', StateMachine, {}, state);
}


// animations

function addAnimation(entity, image, animation='default') {
    addSpriteSheet(entity, image);
    addComponent(entity, 'animator', Animator, {}, animation);
}

export default {
    addComponent,
    addToGroup: (group, ...args) => {
        group.entities.forEach(e => addComponent(e, ...args));
    },

    addPhysics: (entity, friction=0, gravity=0) => {
        addComponent(entity, 'physics', Physics, {friction, gravity});
    },

    addStates,
    parseStates: (entity, data, coniditonMap, state='default') => {
        addStates(entity, state);
    
        parseStateMachine(
            entity.states,
            data,
            coniditonMap
        );
    },

    addImage: (entity, image) => {
        addGraphics(entity, ImageGraphics, {}, image);
    },

    addSpriteSheet,
    addAnimation,
    parseAnimation: (entity, image, data, animation='default', expandLR=false) => {
        addAnimation(entity, image, animation);
    
        parseAnimation(
            entity.animator,
            data,
            expandLR
        );
    },

    addTextGraphics: (entity, font) => {
        addGraphics(entity, TextGraphics, {}, font);
    },

    addShapeGraphics: (entity, color) => {
        addGraphics(entity, ShapeLayerGraphics, {color});
    }
}