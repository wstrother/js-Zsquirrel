import { Font } from "../graphics.js";
import debug from './methods/debug.js';
import controls from './methods/controls.js';
import components from "./methods/components.js";
import make from './methods/make/entities.js';

export class GameDebugInterface {
    constructor(context) {
        this.context = context;


        let [fontImage, fontData] = [
            this.context.getValue('debug-font.png'),
            this.context.getValue('fonts/font.json')
        ];
        try {
            this.defaultFont = this.getFont(fontImage, fontData);
        } catch {
            console.warn('No Debug Font was set because "font.png" or "fonts/debug.json" failed to load')
        }
    }

    getFont(fontImage, fontData) {
        let {size, rowLength, chars, scale} = fontData;
        let [width, height] = size;

        let font = new Font(fontImage, width, height, rowLength, chars, scale || 1);
        this.context.model.set('Debug Font', font);

        return font
    }

    // common component setters

    setTextGraphics(entity) {
        if (!this.defaultFont) {
            throw Error('GameDebugInterface.font has not been initialized');
        }

        components.addTextGraphics(entity, this.defaultFont);
    }
    
    // graphically tracking properties

    makeShapeLayer(parentLayer, color, getShapes, name='') {
        let layer = make.addShapesLayer(
            `Debug ${name} Layer (color: '${color}')`,
            parentLayer,
            color
        );
        this.context.model.set(layer.name, layer);

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

    trackAnimationRects(layer, target, color, position) {
        const rectLayer = this.makeShapeLayer(
            layer,
            color,
            () => target.animator.currentRects,
            'animation rects'
        );

        let imageSprite = make.addImageSprite(
            'Animation Sheet Sprite',
            target.graphics.textureMap.imageResource,
            {position, layer}
        );
        this.context.model.set(imageSprite.name, imageSprite);
        
        rectLayer.events.listen('spawn', () => {
            rectLayer.setSize(
                imageSprite.graphics.width, 
                imageSprite.graphics.height
            );
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
            
            controls.mapButtonConditional(
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

    reportModelAverage(entity, key, interval=5, label=false) {
        const getAverage = debug.getValueAverager(
            () => this.context.model.get(key), 
            interval
        );

        this.reportValue(
            entity,
            getAverage,
            interval,
            label
        );
    }

    reportModelValue(entity, key, interval=1, label=false) {
        key = key.toLowerCase();
        this.reportValue(
            entity,
            () => this.context.model.get(key),
            interval,
            label
        );
    }

    reportValue(entity, getValue, interval=1, label=false) {
        this.setTextGraphics(entity);

        entity.updateMethods.push(
            debug.getIntervalSetText(entity, getValue, interval, label)
        );
    }

    trackModelValues(layer, position, ...keys) {
        keys.forEach(key => {
            let label = make.addTextSprite(
                `Value '${key}' Debug Label`, 
                this.defaultFont, 
                {layer, position}
            );

            this.reportModelValue(label, key, 5, key);
            
            this.context.model.set(label.name, label);

            position[1] += (this.defaultFont.size[0] + 1) * this.defaultFont.scale;
        });
    }
}

