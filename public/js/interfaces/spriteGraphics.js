import { AnimationGraphics } from "../animations/animationGraphics.js";
import { AnimationParser } from "../animations/animationParser.js";
import { Rect } from "../geometry.js";
import { ImageGraphics, ImageSubGraphics } from "../graphics.js";

export class SpriteGraphicsInterface {
    constructor(context) {
        this.context = context;
    }

    setImage(entity, image) {
        entity.graphics = new ImageGraphics(entity, image);
    }

    setGraphics(entity, image, rect) {
        entity.graphics = new ImageSubGraphics(
            entity, image, new Rect(...rect),
        );
    }

    setAnimation(entity, animationJson, image) {
        const parser = new AnimationParser();
        parser.parseFile(animationJson);
        
        console.log(parser.animatonMap);
        console.log(parser.rectMap);

        entity.graphics = new AnimationGraphics(entity, image);
        entity.graphics.rectMap = parser.rectMap;
        
        parser.rectMap.forEach((value, key) => {
            entity.graphics.addFrameSprite(key, value);
        });

        let animations = [];
        parser.animatonMap.forEach(anim => { animations.push(anim)});

        const setAnimation = (index) => {
            let anim = animations[index];
            entity.currentAnimation = anim;
        }
        
        let i = 1;
        setAnimation(i);
        
        entity.events.listen('cycleAnimation', (direction) => {
            i += direction;
            if (i < 0) { i = animations.length - 1; }
            i = i % animations.length;
            setAnimation(i);
        });
        
        entity.updateMethods.push(() => {
            entity.currentAnimation.update();
            entity.graphics.activeSprites = entity.currentAnimation.currentFrame.sprites;
        });

    }
}