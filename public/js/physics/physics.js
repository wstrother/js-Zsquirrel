import { Rect, Vector2 } from "../geometry.js";

export class Physics {
    constructor(entity) {
        this.entity = entity;
        this._heading = new Vector2(1, 0);
        this._velocity = new Vector2(0, 0);
        this.forces = [];
        this.friction = 0;
        this.gravity = 0;
        this.mass = 1;
    }

    get heading() {
        return this._heading.coordinates;
    }

    get velocity() {
        return this._velocity.coordinates;
    }

    get x() {
        return this._velocity.x;
    }

    get y() {
        return this._velocity.y;
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
        this._heading.rotate(0.5);
    }

    applyForce(force) {
        this.forces.push(force);
    } 

    applyFriction() {
        let friction = this._velocity.getCopy().rotate(0.5);
        friction.scale(this.friction);

        this.applyForce(friction);
    }

    applyGravity() {
        this.applyForce(new Vector2(0, this.gravity));
    }

    integrateForces() {
        this.forces.forEach(force => {
            this._velocity.move(force);
        });
        this.forces.length = 0;
    }

    update() {
        if (this.friction) {
            this.applyFriction();
        }

        if (this.gravity) {
            this.applyGravity();
        }

        this.integrateForces();

        let [dx, dy] = this.velocity;
        dx /= this.mass;
        dy /= this.mass;
        this.entity.move(dx, dy);
    }
}