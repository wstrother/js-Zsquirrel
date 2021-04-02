import { Vector2 } from "../geometry.js";

export class Movement {
    constructor(entity) {
        this.entity = entity;
        this._heading = new Vector2(1, 0);
    }

    get heading() {
        return this._heading.coordinates;
    }

    get x() {
        return this._heading.x;
    }

    get y() {
        return this._heading.y;
    }

    get dirString() {
        let [x, y] = this.heading;

        if (x == 1) {
            return 'right';
        }

        if (x == -1) {
            return 'left';
        }

        if (y == -1) {
            return 'up';
        }

        if (y == 1) {
            return 'down';
        }

        return '';
    }

    reverse() {
        this._heading.x *= -1;
    }
}