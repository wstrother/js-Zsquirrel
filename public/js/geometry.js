
export class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get coordinates() {
        return [this.x, this.y];
    }

    set coordinates(coordinates) {
        let x, y;
        [x, y] = coordinates;

        this.x = x;
        this.y = y;
    }

    set(x, y) {
        this.x = x;
        this.y = y;
    }

    add(...args) {
        let dx, dy;

        if (args.length === 1) {
            [dx, dy] = args[0].x, args[0].y;
        } else if (args.length === 2) {
            [dx, dy] = args;
        } else {
            throw Error("Bad signature passed to Vector2.add");
        }

        return new Vector2(this.x + dx, this.y + dy);
    }

    change(...args) {
        let dx, dy;

        if (args.length === 1) {
            [dx, dy] = args[0].x, args[0].y;
        } else if (args.length === 2) {
            [dx, dy] = args;
        } else {
            throw Error("Bad signature passed to Vector2.change");
        }

        this.x = this.x + dx;
        this.y = this.y + dy;
    }
}


export class Rect {
    constructor(...args) {
        let width, height, x, y;

        if (args.length === 2) {
            // parameters signature: (positionVector2, sizeVector2)
            if (typeof(args[0]) === Vector2) {
                [x, y] = args[0].coordinates;
                [width, height] = args[1].coordinates;
            }

            // parameters signature: (width, height)
            [x, y] = [0, 0];
            [width, height] = args;


        // parameters signature: (x, y, width, height)
        } else if (args.length === 4) {
            [x, y, width, height] = args;

        // parameters signature: (x, y, sizeVector2)
        } else if (args.length === 3) {
            [x, y, width, height] = [args[0], args[1], ...args[2].coordinates];


        } else {
            throw Error("Bad signature passed to Rect.constructor");
        }

        this._position = new Vector2(x, y);
        this._size = new Vector2(width, height);
    }

    setSize(x, y) {
        this._size.coordinates = x, y;
    }

    get size() {
        return this._size.coordinates;
    }

    setPosition(x, y) {
        this._position.coordinates = x, y;
    }

    get position() {
        return this._position.coordinates;
    }

    get width() {
        return this._size.x;
    }

    get height() {
        return this._size.y;
    }

    get top() {
        return this._position.y;
    }

    get left() {
        return this._position.x;
    }

    get right() {
        return this.left + this.width;
    }

    get bottom() {
        return this.top + this.height;
    }

    get topLeft() {
        return [this.left, this.top];
    }

    get topRight() {
        return [this.right, this.top];
    }

    get bottomLeft() {
        return [this.left, this.bottom];
    }

    get bottomRight() {
        return [this.right, this.bottom];
    }

    get center() {
        return [
            this.left + (this.width / 2),
            this.top + (this.height / 2)
        ];
    }
}