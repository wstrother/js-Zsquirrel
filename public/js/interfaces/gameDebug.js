import { Layer } from "../entities.js";
import { Rect } from "../geometry.js";
import { RectLayerGraphics, TextGraphics } from "../graphics.js";

export class GameDebugInterface {
    constructor(context) {
        this.context = context;
    }

    setStateHud(entity, target) {
        const graphics = new TextGraphics(entity);
        entity.addComponent('graphics', graphics);
        
        entity.updateMethods.push(() => {
            let animator = target.animator;

            let text;
            if (animator.currentAnimation) {
                text = `${animator.currentAnimation.frameCount} ${animator.current}`;
            }
            else {
                text = `No '${animator.current}' animation found`;
            }
            entity.graphics.setText(text);
        });
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

        const graphics = new RectLayerGraphics(rectLayer);
        rectLayer.addComponent('graphics', graphics, true);
        graphics.color = "0xff1010";

        rectLayer.updateMethods.push(() => {
            let rects = animSprite.animator.currentRects;
            rectLayer.graphics.rects = rects;
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

    setModelValue(entity, key, interval=5) {
        const graphics = new TextGraphics(entity);
        entity.addComponent('graphics', graphics);

        let frames = 0;
        let last = "";
        let cache = [];

        const format = (t) => {
            return Number.parseFloat(t).toPrecision(4);
        }

        const getText = () => {
            let value = this.context.model.get(key);
            
            if (cache.length > interval) {
                cache = cache.slice(1);
            }
            cache.push(value);
            value = this.getAverage(cache);

            let current = format(value);

            if (frames % interval === 0) {
                last = current;
            }

            frames++;

            entity.graphics.setText(last);
        }

        entity.updateMethods.push(getText);
    }

    getAverage(cache) {
        let sum = 0;
        cache.forEach(v => {
            sum += v;
        });

        return sum / cache.length;
    }
}