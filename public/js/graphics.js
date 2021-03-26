

class Graphics {
    constructor(entity) {
        this.entity = entity;
    }

    draw() {
        throw Error("Graphics is an abstract base class, draw() should be implemented by a sub class");
    }
}


export class ImageGraphics extends Graphics {

    // entity is Entity object, image is canvasElement
    constructor(entity, image) {
        super(entity);
        this.image = image;

        this.mirror = [false, false];
    }

    draw(context) {
        context.drawImage(this.image, ...this.entity.position);
    }
}

export class ImageSubGraphics extends ImageGraphics {

    // entity is Entity object, image is canvasElement, rect is Rect object
    constructor(entity, image, rect) {
        super(entity, image);
        this.rect = rect;
    }

    draw(context) {
        
        context.drawImage(
            this.image,
            ...this.rect.position,
            ...this.rect.size,
            ...this.entity.position,
            ...this.rect.size
        );
    }
}


export class Screen {
    constructor(canvas) {
        this.canvas = canvas
        this.context = canvas.getContext('2d');
    }

    clear() {
        this.context.clearRect(
            0, 0,
            this.canvas.width,
            this.canvas.height
        );
    }

    draw(entities, layer=null) {
        this.clear();

        entities.forEach(e => {
            if (e.graphics && e.layer === layer) {
                e.graphics.draw(this.context); 
            }
        });
    }
}

export class LayerGraphics extends Graphics {
    constructor(entity) {
        super(entity);

        this.buffer = document.createElement('canvas');
        this.screen = new Screen(
            this.buffer
        );
    }

    setSize(width, height) {
        this.buffer.width = width;
        this.buffer.height = height;
    }

    get subEntities() {
        return this.entity.entities;
    }

    getImage() {
        this.screen.draw(this.subEntities, this.entity);
        return this.screen.canvas;
    }

    draw(context) {
        let image = this.getImage();

        context.drawImage(image, ...this.entity.position);
    }
}