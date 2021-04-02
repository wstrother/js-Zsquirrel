import { Animator } from "../animations/animation.js";
import { AnimationParser } from "../animations/animationParser.js";
import { Rect } from "../geometry.js";
import { CircleLayerGraphics, Font, ImageGraphics, SpriteSheetGraphics, TextGraphics } from "../graphics.js";

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

    setEntityTrackingLayer(layer, target) {
        layer.addComponent('graphics', new CircleLayerGraphics(layer), true);
        layer.graphics.color = "0xFF0101";

        layer.updateMethods.push(() => {
            layer.graphics.circles = [
                {radius: 5, position: target.position}
            ];
        });
    }

    setAnimation(entity, animationJson, image) {
        const parser = new AnimationParser(true);
        parser.parseFile(animationJson);

        const animator = new Animator(
            entity, image, parser.animatonMap, parser.rectMap
        );
        animator.setAnimation('headless');

        console.log(parser.animatonMap);

        entity.addComponent('animator', animator);
    }

    setText(entity, text, fontImage, fontData, wrap=false) {
        let {size, rowLength, chars, scale} = fontData;
        let [width, height] = size;

        let font = new Font(fontImage, width, height, rowLength, chars, scale || 1);

        entity.addComponent('graphics', new TextGraphics(entity, font));
        entity.graphics.setText(text, wrap);
    }
}