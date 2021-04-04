import { Animator } from "../animations/animation.js";
import { AnimationParser } from "../animations/animationParser.js";
import { Rect } from "../geometry.js";
import { ImageGraphics, SpriteSheetGraphics } from "../graphics.js";


export class SpriteGraphicsInterface {
    constructor(context) {
        this.context = context;
    }

    setImage(entity, image) {
        entity.addComponent('graphics', new ImageGraphics(entity, image));
    }

    setImageSubGraphics(entity, image, rect) {
        const graphics = new SpriteSheetGraphics(
            entity, image
        );
        entity.addComponent('graphics', graphics);

        rect = new Rect(...rect);
        entity.graphics.addSprite(rect.toString(), rect);
        entity.graphics.activeSprites.push(rect.toString());
    }
    
    setAnimation(entity, animationJson, image) {
        const parser = new AnimationParser(true);
        parser.parseFile(animationJson);

        const animator = new Animator(
            entity, image, parser.animatonMap, parser.rectMap
        );
        animator.setAnimation('walk');

        console.log(parser.animatonMap);

        entity.addComponent('animator', animator);
    }
}