import { Layer } from "../entities.js";
import { ShapeLayerGraphics, Font, TextGraphics } from "../graphics.js";
import debug from './methods/debug.js';
import controls from './methods/controls.js';

export class GameDebugInterface {
    constructor(context) {
        this.context = context;
        this.font = null;
    }

    setFont(fontImage, fontData) {
        let {size, rowLength, chars, scale} = fontData;
        let [width, height] = size;

        this.font = new Font(fontImage, width, height, rowLength, chars, scale || 1);
        this.context.model.set('Debug Font', this.font);
    }

    // common component setters

    setTextGraphics(entity) {
        if (!this.font) {
            throw Error('GameDebugInterface.font has not been initialized');
        }

        entity.addComponent('graphics', new TextGraphics(entity, this.font));
    }

    setShapeLayerGraphics(entity, color) {
        entity.addComponent('graphics', new ShapeLayerGraphics(entity), true);
        entity.graphics.color = color;
    }

    // graphically tracking properties

    makeShapeLayer(parentLayer, color, getShapes, name='') {
        const layerName = `Debug ${name} Layer (color: '${color}')`;
        const layer = new Layer(layerName);
        this.context.model.set(layerName, layer);

        this.setShapeLayerGraphics(layer, color);

        parentLayer.events.listen('spawn', () => {
            layer.setLayer(parentLayer);
        });

        layer.updateMethods.push(
            debug.getShapesUpdate(
                layer,
                getShapes
            )
        );

        return layer;
    }

    trackPoint(layer, name, color, radius, ...entities) {
        const getCircle = debug.getCircle(
            (entity) => entity[name],
            radius
        );

        const getShapes = debug.getShapeCallback(
            getCircle, () => entities
        );

        this.makeShapeLayer(
            layer, 
            color, 
            getShapes,
            name
        );
    }

    trackEntityPoints(layer, name, color, radius, group) {
        const getCircle = debug.getCircle(
            (entity) => entity[name],
            radius
        );

        const getShapes = debug.getShapeCallback(
            getCircle, () => group.entities
        );

        this.makeShapeLayer(
            layer, 
            color, 
            getShapes,
            name
        );
    }

    trackVector(layer, name, color, ...entities) {
        const getVector = debug.getVector(
            (entity) => entity[name]
        );

        const getShapes = debug.getShapeCallback(
            getVector, () => entities
        );

        this.makeShapeLayer(
            layer, 
            color, 
            getShapes,
            name
        );
    }

    trackEntityVectors(layer, name, color, group, scale=1) {
        const getVector = debug.getVector(
            (entity) => entity[name],
            (entity) => entity.position,
            scale
        );

        const getShapes = debug.getShapeCallback(
            getVector, () => group.entities
        );
        
        this.makeShapeLayer(
            layer, 
            color, 
            getShapes,
            name
        );
    }

    trackComponentVectors(layer, component, name, color, group, scale=1) {
        const getVector = debug.getVector(
            (entity) => entity[component][name],
            (entity) => entity.position,
            scale
        );

        const getShapes = debug.getShapeCallback(
            getVector, () => group.entities
        );

        this.makeShapeLayer(
            layer, 
            color, 
            getShapes,
            name
        );
    }

    trackAnimationRects(layer, imageSprite, animSprite, color) {
        const rectLayer = this.makeShapeLayer(
            layer,
            color,
            () => animSprite.animator.currentRects,
            'animation rects'
        );

        rectLayer.events.listen('spawn', () => {
            let image = imageSprite.graphics.sprite;
    
            rectLayer.setSize(image.width, image.height);
            rectLayer.setPosition(...imageSprite.position);
        });
    }

    // controller methods

    setAnimationCycler(entity, controller) {
        controls.setUiControls(
            controller,

            controls.mapUdlr(
                dx => entity.events.emit('cycleAnimation', dx),
                true
            )
        );
        
        entity.events.listen('cycleAnimation', (direction) => {
            let animator = entity.animator;
            let animations = animator.animationNames;

            let i = animations.findIndex(key => key === animator.current);
            
            i += direction;
            if (i < 0) { i = animations.length - 1; }
            i = i % animations.length;

            animator.setAnimation(animations[i]);

            if (entity.paused) {
                entity.update();
            }
        });
    }

    addUdlr(entity, controller, speed=1) {
        const moveEntity = controls.mapUdlr(
            (dx, dy) => entity.move(dx * speed, dy * speed)
        );
        
        controls.setControls(entity, controller, moveEntity);
    }

    setPauseButton(entity, controller) {
        controls.setUiControls(
            controller,

            controls.mapButton(
                'start', () => entity.setPaused(!entity.paused)),
            
            controls.mapButton(
                'A', () => entity.update(),
                () => entity.paused)
        );
    }

    // HUD / model value reporting

    updateModelValue(entity, key, name) {
        entity.updateMethods.push(() => {
            this.context.model.set(key, entity[name]);
        });
    }

    animationStateHud(entity, target, interval=1) {
        const getAnimationState = () => {
            let animator = target.animator;

            if (animator.currentAnimation) {
                return `${animator.currentAnimation.frameCount} ${animator.current}`;
            }
            else {
                return `No '${animator.current}' animation found`;
            }
        }

        this.reportValue(entity, getAnimationState, interval);
    }

    reportModelAverage(entity, key, interval=5) {
        const getAverage = debug.getValueAverager(
            () => this.context.model.get(key), 
            interval
        );

        this.reportValue(
            entity,
            getAverage,
            interval
        );
    }

    reportModelValue(entity, key, interval=1) {
        this.reportValue(
            entity,
            () => this.context.model.get(key),
            interval
        );
    }

    reportValue(entity, getValue, interval=1) {
        this.setTextGraphics(entity);

        entity.updateMethods.push(
            debug.getIntervalSetText(entity, getValue, interval)
        );
    }
}

