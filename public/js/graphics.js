export class Screen {
    constructor(container) {
        this.container = container;
    }

    clear() {
        this.container.removeChildren();
    }

    draw(entities) {
        this.clear();

        entities.forEach(e => {
            if (e.graphics && e.visible) {
                e.graphics.draw(this.container);
            }
        });
    }
}


class Graphics {
    constructor(entity) {
        this.entity = entity;
    }

    draw() {
        throw Error("Graphics is an abstract base class, draw() should be implemented by a sub class");
    }
}
 

export class ImageGraphics extends Graphics {
    constructor(entity, imageResource, scaleX=1, scaleY=1) {
        super(entity);
        this.imageResource = imageResource;
        this.sprite = new PIXI.Sprite(imageResource);
        this.sprite.anchor.set(0.5, 0.5);
        this.sprite.roundPixels = true;

        if (scaleX !== 1 || scaleY !== 1) {
            this.setScale(scaleX, scaleY);
        }
    }

    scaleSprite(sprite, scaleX, scaleY) {
        sprite.setTransform(0, 0, scaleX, scaleY);
    }
    
    setScale(scaleX, scaleY) {
        this.scaleSprite(this.sprite, scaleX, scaleY);
    }

    setMirror(mirrorX, mirrorY) {
        this.setScale(
            mirrorX ? -1 : 1,
            mirrorY ? -1 : 1
        );
    }

    setDrawPoint(sprite, [x, y]) {
        let [w, h] = [sprite.width, sprite.height];
        x += w / 2;
        y += h / 2;

        sprite.x = x;
        sprite.y = y;
    }

    drawSprite(container, sprite, position) {
        this.setDrawPoint(sprite, position);
        container.addChild(sprite);
    }
    
    draw(container) {
        this.drawSprite(container, this.sprite, this.entity.position);
    }
}

export class ImageSubGraphics extends ImageGraphics {

    // entity is Entity object, image is canvasElement, rect is Rect object
    constructor(entity, imageResource, rect=null, scaleX=1, scaleY=1) {
        super(entity, imageResource, scaleX, scaleY);

        this.baseTexture = imageResource.baseTexture;

        this.sprites = [];
        
        if (rect) { this.addRect(rect); }
    }

    addRect(rect) {
        let [x, y] = rect.position;
        let [w, h] = rect.size;
        let [ox, oy] = rect.offset;
        let [sx, sy] = rect.scale;
        ox *= sx;
        oy *= sy;

        let frame = new PIXI.Rectangle(x, y, w, h);
        let texture = new PIXI.Texture(this.baseTexture, frame);
        let sprite = new PIXI.Sprite(texture);

        sprite.anchor.set(0.5, 0.5);
        this.setSpriteOffset(sprite, ox, oy);
        this.scaleSprite(sprite, sx, sy);

        this.sprites.push(sprite);
    }

    setSpriteOffset(sprite, x, y) {
        let [w, h] = [sprite.width, sprite.height];
        x /= w;
        y /= h;
        sprite.anchor.x -= x;
        sprite.anchor.y -= y;
    }

    draw(container) {
        this.sprites.forEach(sprite => {
            this.drawSprite(container, sprite, this.entity.position);
        })
    }
}


export class LayerGraphics extends Graphics {
    constructor(entity) {
        super(entity);

        this.screen = new Screen(
            new PIXI.Container()
        );
    }

    get image() {
        return this.screen.container;
    }

    setSize(width, height) {
        this.image.width = width;
        this.image.height = height;
    }

    setScale(x, y) {
        this.image.setTransform(0, 0, x, y);
    }

    get subEntities() {
        return this.entity.entities;
    }

    setImage() {
        let [x, y] = this.entity.position;
        this.image.x = x;
        this.image.y = y;
        this.screen.draw(this.subEntities);
    }

    draw(container) {
        this.setImage();

        container.addChild(this.image);
    }
}

export class RectLayerGraphics extends LayerGraphics {
    constructor(entity) {
        super(entity);

        this.color = "";
        this.rects = [];
    }

    setImage() {
        super.setImage();
        const container = this.image;

        let graphics = new PIXI.Graphics();
        graphics.lineStyle(1, this.color);

        this.rects.forEach((rect)=> {
            graphics.drawRect(...rect.position, ...rect.size);    
        });

        container.addChild(graphics);
    }

}


export class TextGraphics extends Graphics {
    constructor(entity) {
        super(entity);

        this.image = null;
        this.text = "";
        this.style = {fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'left'};
    }

    setText(text) {
        if (this.text !== text) {
            this.image = this.getImage(text);
        }
    }

    setPosition() {
        let [x, y] = this.entity.position;
        this.image.x = x;
        this.image.y = y;
    }

    getImage(text) {
        return new PIXI.Text(text, this.style);
    }

    draw(container) {        
        if (this.image) {
            this.setPosition();
            container.addChild(this.image);
        }        
    }
}