import { Layer } from "../entities.js";
import { Rect } from "../geometry.js";
import { RectLayerGraphics, TextGraphics } from "../graphics.js";

export class GameDebugInterface {
    constructor(context) {
        this.context = context;
    }

    setStateHud(entity, target) {
        entity.graphics = new TextGraphics(entity);
        
        // entity.graphics.color = "black";
        // entity.graphics.font = "20px Courier New";
        
        entity.updateMethods.push(() => {
            let text = `${target.currentAnimation.frameCount} ${target.currentAnimation.name}`;
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

        rectLayer.graphics = new RectLayerGraphics(rectLayer);
        rectLayer.graphics.color = "0xff1010";

        rectLayer.updateMethods.push(() => {
            let rects = animSprite.currentAnimation.currentFrame.sprites;
            rects = rects.map(key => animSprite.graphics.rectMap.get(key));
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

    // setRectGraphics(layer, color, group) {
    //     layer.graphics = new RectLayerGraphics(layer);

    //     layer.graphics.getRects = () => {
    //         return group.entities.map(entity => {
    //             let rect;
    //             if (entity.graphics.rect) {
    //                 rect = new Rect(...entity.position, ...entity.graphics.rect.size)
    //             } else {
    //                 let img = entity.graphics.image;
    //                 let size = [
    //                     img.width,
    //                     img.height
    //                 ]
    //                 rect = new Rect(...entity.position, ...size);
    //             }

    //             return {rect, color};
    //         });
    //     }
    // }

    setModelValue(entity, key, interval=5) {
        entity.graphics = new TextGraphics(entity);

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

        entity.graphics.color = "black";
        entity.graphics.font = "15px Courier New"
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