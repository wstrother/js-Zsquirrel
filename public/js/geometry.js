
export class Vector2 {
    constructor(...args) {
        let [x, y] = Vector2.parseArgs(...args);

        this.x = x;
        this.y = y;
    }

    getCopy() {
        return new Vector2(this);
    }

    static parseArgs(...args) {
        let x, y;

        // Vector2 was passed
        if (args.length === 1) {
            [x, y] = [args[0].x, args[0].y];

        // [x, y] was passed
        } else if (args.length === 2) {
            [x, y] = args;

        } else {
            throw Error("Bad signature passed to Vector2.parseArgs");
        }

        return [x, y];
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

    get magnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    setMagnitude(m) {
        let m0 = this.magnitude;
        if (m0 !== 0) {
            let r = m / m0;
            this.x *= r;
            this.y *= r;
        } else {
            this.x = m;
            this.y = 0;
        }

        return this;
    }

    // get rotation in terms of Tau Radians (i.e. 1 = a full rotation)
    get angle() {
        let angle = Math.atan2(-this.y, this.x);
        angle /= Math.PI * 2;

        // adjust the output range from 0 to 1 instead of -.5 to .5
        if (angle > 0) {
            return angle;
        }

        else {
            return 1 + angle;
        }
    }

    setAngle(angle) {
        let delta = angle - this.angle;
        this.rotate(delta);

        return this;
    }

    // adjust the angle in Tau Radians (i.e. 1 = a full rotation) 
    rotate(turns) {
        turns *= 2 * Math.PI;
        let [i, j] = [Math.cos(turns), Math.sin(turns)];

        this.multiply(i, -j);

        return this;
    }

    set(...args) {
        let [x, y] = Vector2.parseArgs(...args);
        this.x = x;
        this.y = y;
    }

    // returns a new Vector2 that is the result of addition
    add(...args) {
        let [dx, dy] = Vector2.parseArgs(...args);

        return new Vector2(this.x + dx, this.y + dy);
    }

    scale(magnitude) {
        this.x *= magnitude;
        this.y *= magnitude;

        return this;
    }

    multiply(...args) {
        let [a, b] = Vector2.parseArgs(...args);
        let [c, d] = this.coordinates;

        // simplified FOIL formula
        let [i, j] = [
            (a * c) - (b * d),
            (a * d) + (b * c)
        ]

        this.x = i;
        this.y = j;

        return this;
    }

    // alters Vector2 instance in place
    move(...args) {
        let [dx, dy] = Vector2.parseArgs(...args);

        this.x = this.x + dx;
        this.y = this.y + dy;

        return this;
    }
}


export class Rect {
    constructor(...args) {
        let [x, y, width, height] = Rect.parseArgs(...args);

        this._position = new Vector2(x, y);
        this._size = new Vector2(width, height);

        this._offset = new Vector2(0, 0);
        this._scale = new Vector2(1, 1);
        this._rotation = new Vector2(1, 0);
    }

    static parseArgs(...args) {
        let x, y, width, height;

        // parameter is single Rect
        if (args.length === 1) {
            let rect = args[0];

            [x, y, width, height] = [...rect.position, ...rect.size]

        } else if (args.length === 2) {
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

        // parameters signature: (x, y, size: Vector2)
        } else if (args.length === 3) {
            [x, y, width, height] = [args[0], args[1], ...args[2].coordinates];


        } else {
            throw Error("Bad signature passed to Rect.parseArgs");
        }

        return [x, y, width, height];
    }

    toString() {
        let key = [this.top, this.left, this.width, this.height].toString();
        return key
    }

    set(...args) {
        let width, height, x, y = Rect.parseArgs(...args);

        this.setSize(width, height);
        this.setPosition(x, y);
    }

    setSize(width, height) {
        this._size.coordinates = [width, height];
    }

    get size() {
        return this._size.coordinates;
    }

    setPosition(x, y) {
        this._position.coordinates = [x, y];
    }

    get position() {
        return this._position.coordinates;
    }

    setOffset(x, y) {
        this._offset.coordinates = [x, y];
    }

    get offset() {
        return this._offset.coordinates;
    }

    get scale() {
        return this._scale.coordinates;
    }

    setScale(x, y) {
        this._scale.coordinates = [x, y];
    }

    setMirror(mx, my) {
        let [sx, sy] = this.scale;

        this.setScale(
            sx * mx ? -1 : 1,
            sx * my ? -1 : 1
        );
    }

    get mirror() {
        let [sx, sy] = this.scale;
        
        return [
            sx < 0,
            sy < 0
        ];
    }

    get angle() {
        return this._rotation.angle;
    }

    setAngle(theta) {
        this._rotation.angle = theta;
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

    setCenter(x, y) {
        let [dx, dy] = [this.width / 2, this.height / 2];
        this.setPosition(x - dx, y - dy);
    }

    get tlrb() {
        return [
            this.top, this.left,
            this.right, this.bottom
        ];
    }

    get corners() {
        return [
            this.topLeft, this.topRight,
            this.bottomLeft, this.bottomRight
        ];
    }
}


export class SquareMatrix2 {
    constructor(values) {
        let [a, b] = values[0];
        let [c, d] = values[1];

        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
    }

    static getFromVectors(i, j) {
        let m = [
            [i.x, j.x],
            [i.y, j.y]
        ];

        return new SquareMatrix2(m);
    }

    getVectors() {
        return [
            new Vector2(this.a, this.c),
            new Vector2(this.b, this.d)
        ];
    }

    multiplyVector(...args) {
        let [x, y] = Vector2.parseArgs(...args);
        let i, j;

        i = (this.a * x) + (this.b * y);
        j = (this.c * x) + (this.d * y);

        return new Vector2(i, j);
    }

    multiplyMatrix(m2) {
        let [i, j] = m2.getVectors();

        let i2 = this.multiplyVector(i);
        let j2 = this.multiplyVector(j);

        return SquareMatrix2.getFromVectors(i2, j2);
    }
}


export function getBasisVectorsInDirection(angle) {
    return [
        new Vector2(1, 0).rotate(angle),
        new Vector2(0, 1).rotate(angle)
    ]
}


export function scaleVectorInDirection(vector, angle, scale) {

    let [i, j] = getBasisVectorsInDirection(-angle);

    let m1 = SquareMatrix2.getFromVectors(i, j);
    let m2 = new SquareMatrix2([
        [scale, 0],
        [0, 1]
    ]);

    let m = m2.multiplyMatrix(m1);

    let newVector = m.multiplyVector(vector);

    vector.set(...newVector.coordinates);
    vector.rotate(angle);

    return vector;
}
