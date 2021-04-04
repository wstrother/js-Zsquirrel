import { Layer } from "../entities.js";
import { Rect } from "../geometry.js";
import { ShapeLayerGraphics, Font, TextGraphics } from "../graphics.js";
import debug from './methods/debug.js';

export class GameDebugInterface {
    constructor(context) {
        this.context = context;
        this.font = null;
    }

    setFont(fontImage, fontData) {
        let {size, rowLength, chars, scale} = fontData;
        let [width, height] = size;

        this.font = new Font(fontImage, width, height, rowLength, chars, scale || 1);
    }

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

    trackEntityShapes(layer, color, getShape, getEntities) {
        const subName = `Debug Layer (color: '${color}')`;
        const subLayer = new Layer(subName);
        this.context.model.set(subName, subLayer);
        this.setShapeLayerGraphics(subLayer, color);

        layer.events.listen('spawn', () => {
            subLayer.setLayer(layer);
        });

        subLayer.updateMethods.push(debug.getShapeGraphicsUpdate(
            subLayer,
            getShape,
            getEntities
        ));
    }

    trackPoint(layer, name, color, radius, ...entities) {
        const getCircle = debug.getCircleArg(
            debug.entityPropertyGetter(name), 
            radius
        );

        this.trackEntityShapes(
            layer, 
            color, 
            getCircle, 
            () => entities
        );
    }

    trackEntityPoints(layer, name, color, radius, group) {
        const getCircle = debug.getCircleArg(
            debug.entityPropertyGetter(name), 
            radius
        );

        this.trackEntityShapes(
            layer, 
            color, 
            getCircle, 
            () => group.entities
        );
    }

    trackVector(layer, name, color, ...entities) {
        const getVector = debug.getVectorArg(
            debug.entityPropertyGetter(name)
        );

        this.trackEntityShapes(
            layer, 
            color, 
            getVector, 
            () => entities
        );
    }

    trackEntityVectors(layer, name, color, group, scale=1) {
        const getVector = debug.getVectorArg(
            debug.entityPropertyGetter(name),
            (entity) => entity.position,
            scale
        );
        
        this.trackEntityShapes(
            layer, 
            color, 
            getVector, 
            () => group.entities
        );
    }

    trackComponentVectors(layer, component, name, color, group, scale=1) {
        const getVector = debug.getVectorArg(
            debug.componentPropertyGetter(component, name),
            (entity) => entity.position,
            scale
        );

        this.trackEntityShapes(
            layer, 
            color, 
            getVector, 
            () => group.entities
        );
    }

    setAnimationRectLayer(layer, imageSprite, animSprite) {
        const rectLayer = new Layer(`${animSprite.name}'s Animation Frame Rect HUD`);
        this.context.addEntity(rectLayer);

        rectLayer.setLayer(layer);

        rectLayer.events.listen('spawn', () => {
            let image = imageSprite.graphics.sprite;
    
            rectLayer.setSize(image.width, image.height);
            rectLayer.setPosition(...imageSprite.position);
        });

        const graphics = new ShapeLayerGraphics(rectLayer);
        rectLayer.addComponent('graphics', graphics, true);
        graphics.color = "0xff1010";

        rectLayer.updateMethods.push(() => {
            let rects = animSprite.animator.currentRects;
            rectLayer.graphics.shapes = rects;
        });
    }

    setAnimationCycler(entity, controller) {
        
        controller.updateMethods.push(() => {
            let [l, r] = ["left", "right"].map(d => controller.devices.get(d));
            let direction = 0;

            if (l.check()) { direction--; }
            if (r.check()) { direction++; }

            if (direction !== 0) {
                entity.events.emit('cycleAnimation', direction);
            }
        });
        
        entity.events.listen('cycleAnimation', (direction) => {
            let animator = entity.animator;
            let animations = animator.animationNames;

            let i = animations.findIndex(key => key === animator.current);
            
            i += direction;
            if (i < 0) { i = animations.length - 1; }
            i = i % animations.length;

            animator.setAnimation(animations[i]);
        });
    }

    setPauseButton(entity, controller) {
       controller.updateMethods.push(() => {
            let start = controller.devices.get("start");
            let a = controller.devices.get("A");
            
            if (start.check()) {
                let paused = !entity.paused;
                entity.setPaused(paused);
            }

            if (a.check() && entity.paused) {
                entity.update();
            }
        });
    }

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

