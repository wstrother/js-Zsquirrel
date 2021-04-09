import { Rect } from "./geometry.js";


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


function TransformSprite(sprite, offset=[0, 0], scale=[1, 1], angle=0, topLeft=false) {
    let [ox, oy] = offset;
    let [sx, sy] = scale;
    angle *= (2 * Math.PI);

    if (!topLeft) {
        sprite.anchor.set(0.5, 0.5);
    }

    sprite.setTransform(sprite.x + ox, sprite.y + oy, sx, sy, angle);
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

    get width() {
        return this.sprite.width;
    }

    get height() {
        return this.sprite.height;
    }

    get size() {
        return [this.width, this.height]
    }

    scaleSprite(sprite, scaleX, scaleY) {
        sprite.setTransform(sprite.x, sprite.y, scaleX, scaleY);
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


class TextureMap {
    constructor(imageResource) {
        this.imageResource = imageResource;
        this._map = new Map();
    }

    getTexture(x, y, width, height) {
        return new PIXI.Texture(
            this.imageResource.baseTexture,
            new PIXI.Rectangle(x, y, width, height)
        );
    }

    getSprite(key) {
        return new PIXI.Sprite(this.get(key));
    }

    has(key) {
        return this._map.has(key);
    }

    get(key) {
        return this._map.get(key);
    }

    set(key, value) {
        this._map.set(key, value);
    }

    setTexture(key, ...args) {
        let [x, y, width, height] = Rect.parseArgs(...args);
        this.set(key, this.getTexture(x, y, width, height));
    }
}


export class SpriteSheetGraphics extends Graphics {
    constructor(entity, imageResource) {
        super(entity)

        this.textureMap = new TextureMap(imageResource);
        this.spriteMap = new Map();
        this.rectMap = new Map();
        this.activeSprites = []
    }

    addRect(...args) {
        let rect = new Rect(...args);
        this.textureMap.setTexture(rect.toString(), rect);
    }
    
    addSprite(key, rect) {
        if (!this.textureMap.has(rect.toString())) {
            this.addRect(rect);
        }
        
        let sprite = this.textureMap.getSprite(rect.toString());
                
        this.rectMap.set(key, rect);
        this.spriteMap.set(key, sprite);
    }

    setSpritePosition(key) {
        let sprite = this.spriteMap.get(key);
        let rect = this.rectMap.get(key);
        let [x, y] = this.entity.position;
        sprite.x = x;
        sprite.y = y;

        TransformSprite(sprite, rect.offset, rect.scale, rect.angle);
    }

    draw(container) {
        this.activeSprites.forEach(key => {
            this.setSpritePosition(key);
            container.addChild(this.spriteMap.get(key));
        });
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

    setSize() {
        let [width, height] = this.entity.size;

        this.image.width = width;
        this.image.height = height;
    }

    setScale() {
        this.image.setTransform(
            ...this.entity.position, 
            ...this.entity.scale
        );
    }

    get subEntities() {
        return this.entity.entities;
    }

    setImage() {
        this.setSize();
        this.setScale();
        this.screen.draw(this.subEntities);
    }

    draw(container) {
        this.setImage();

        container.addChild(this.image);
    }
}

export class ShapeLayerGraphics extends LayerGraphics {
    constructor(entity) {
        super(entity);

        this.shapes = [];
        this.color = false;
        this.lineWidth = false;
    }

    setImage() {
        super.setImage();
        const container = this.image;

        let graphics = new PIXI.Graphics();
        graphics.lineStyle(
            this.lineWidth || 1, 
            this.color || '0xFFFFFF'
        );

        this.shapes.forEach(arg => {
            drawShape(graphics, arg);    
        });

        container.addChild(graphics);
    }
}

function drawShape(graphics, arg) {
    if (arg.radius) {
        drawCircle(graphics, arg)
    }

    if (arg.size) {
        drawRect(graphics, arg);
    }

    if (arg.vector) {
        drawVector(graphics, arg);
    }
}

function drawRect(graphics, arg) {
    graphics.drawRect(...arg.position, ...arg.size);
}

function drawCircle(graphics, arg) {
    let [x, y] = arg.position
    graphics.drawCircle(x, y, arg.radius);
}

function drawVector(graphics, arg) {
    let [x1, y1] = arg.position || [0, 0];
    let [x2, y2] = arg.vector.add(x1, y1).coordinates;

    graphics.moveTo(x1, y1);

    graphics.lineTo(x2, y2);
    graphics.drawCircle(x2, y2, 1);
}


export class Font {
    constructor(imageResource, width, height, rowLength, chars, scale=1) {
        this.size = [width, height];
        this.rowLength = rowLength;
        this.scale = scale;
        this.chars = chars;
        this.textureMap = new TextureMap(imageResource);
        this.setCharTextures(chars);
    }

    setCharTextures(chars) {
        for (let i in [...chars]) {
            let char = chars[i];
            let [row, col] = this.getCharPosition(i, this.rowLength);

            this.addChar(char, row, col);
        }
    }

    getCharPosition(i, rowLength) {
        let row = Math.floor(i / rowLength)
        let col = i % rowLength;

        return [row, col];
    }

    addChar(key, row, col) {
        let x, y;
        let [width, height] = this.size;

        x = col * width;
        y = row * height;

        this.textureMap.setTexture(key, x, y, width, height);
    }

    getCharSprite(key, row=0, col=0, x=0, y=0) {
        let [width, height] = this.size;

        let texture = this.textureMap.get(key);
        let sprite = new PIXI.Sprite(texture);

        sprite.x = x + (col * width * this.scale);
        sprite.y = y + (row * height * this.scale);

        TransformSprite(sprite, [0, 0], [this.scale, this.scale], 0, true);

        return sprite;
    }

    getTextSprites(text, x, y, rowLength=false) {        
        let sprites = [];
        let [row, col] = [0, 0];

        [...text].forEach((char, i) => {
           
            if (rowLength) {
                [row, col] = this.getCharPosition(i, rowLength);
            } else {
                [row, col] = [0, i];
            }

            if (char !== " ") {
                sprites.push(this.getCharSprite(char, row, col, x, y));
            } else {
                sprites.push(null);
            }
        });

        return sprites;
    }
}


export class TextGraphics extends Graphics {
    constructor(entity, font) {
        super(entity);

        this.font = font
        this.sprites = [];
    }

    setText(text, rowLength=false) {
        let [x, y] = this.entity.position
        this.sprites = this.font.getTextSprites(text, x, y, rowLength);
    }

    setScale(scale) {
        this.font.scale = scale;
    }

    draw(container) {
        this.sprites.filter(sprite => sprite).forEach(sprite => {
            container.addChild(sprite);
        });
    }
}