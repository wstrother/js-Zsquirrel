import { Rect } from "../geometry.js";
import { ImageSubGraphics } from "../graphics.js";

export class SpriteGraphicsInterface {
    constructor(context) {
        this.context = context;
    }

    setGraphics(entity, image, rect) {
        console.log(`Setting graphics for ${entity.name}`);

        entity.graphics = new ImageSubGraphics(entity, image, new Rect(...rect));
    }
}