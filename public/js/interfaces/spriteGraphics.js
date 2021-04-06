import { Rect } from "../geometry.js";
import components from './methods/components.js';


export class SpriteGraphicsInterface {
    constructor(context) {
        this.context = context;
    }

    setImage(entity, image) {
        components.addImage(entity, image);
    }

    setImageSubGraphics(entity, image, rect) {
        components.addSpriteSheet(entity, image);

        rect = new Rect(...rect);
        entity.graphics.addSprite(rect.toString(), rect);
        entity.graphics.activeSprites.push(rect.toString());
    }
    
    setAnimation(entity, data, image, expandLR=true) {
        components.parseAnimation(
            entity,
            image,
            data,
            'default',
            expandLR
        );
    }
}