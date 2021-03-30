import { Animator } from "../animations/animation.js";
import { AnimationParser } from "../animations/animationParser.js";
import { Rect } from "../geometry.js";
import { ImageGraphics, ImageSubGraphics } from "../graphics.js";

export class SpriteGraphicsInterface {
    constructor(context) {
        this.context = context;
    }

    setImage(entity, image) {
        entity.addComponent('graphics', new ImageGraphics(entity, image));
    }

    setGraphics(entity, image, rect) {
        const graphics = new ImageSubGraphics(
            entity, image, new Rect(...rect),
        );
        entity.addComponent('graphics', graphics);
    }

    setAnimation(entity, animationJson, image) {
        const parser = new AnimationParser(true);
        parser.parseFile(animationJson);

        const animator = new Animator(
            entity, image, parser.animatonMap, parser.rectMap
        );

        console.log(parser.animatonMap);

        entity.addComponent('animator', animator);
    }
}