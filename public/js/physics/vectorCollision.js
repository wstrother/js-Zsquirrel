import { Entity } from "../entities.js";
import { Vector2 } from "../geometry.js";


export class Wall extends Entity {
    constructor(name, x=0, y=0) {
        super(name);

        this.face = new Vector2(x, y);
    }

    static getFromPoints([sx, sy], [ex, ey]) {
        let x = ex - sx;
        let y = ey - sy;

        let wall = new Wall([[sx, sy], [ex, ey]].toString(), x, y);
        wall.setPosition(sx, sy);

        return wall;
    }

    setFace(dx, dy) {
        this.face.set(dx, dy);
    }

    getNormal() {
        return new Vector2(1, 0).rotate(this.face.angle + 0.25);
    }

    rotateAroundPoint(pivot, angle) {
        let [position, vector] = rotateAroundPoint(this.position, this.face, pivot, angle);
        this.setPosition(...position);
        this.face.set(...vector.coordinates);
    }
}


// returns an array [[x, y], vector] such that if a given point
// 
export function rotateAroundPoint(start, vector, pivot, angle) {
    let [vx, vy] = start;
    let [px, py] = pivot;

    let [dx, dy] = [vx - px, vy - py];
    let d = new Vector2(dx, dy);
    d.rotate(angle);

    let newPoint = d.add(...pivot).coordinates;
    let newVector = vector.getCopy().rotate(angle);

    return [newPoint, newVector];
}


// returns the point of collision between two line segments
// each defined by a vector and an origin point
// returns false if the vectors are parallel
export function getVectorCollision(vector1, point1, vector2, point2) {
    let axisCollision = getAxisCollision(vector1, point1, vector2, point2);

    if (!axisCollision) {
        return false;
    }

    let [x, y] = axisCollision;

    const inBounds = (v, [sx, sy]) => {
        let [ex, ey] = v.add(sx, sy).coordinates;

        let xbound = Math.min(sx, ex) <= x && x <= Math.max(sx, ex);
        let ybound = Math.min(sy, ey) <= y && y <= Math.max(sy, ey);

        return xbound && ybound;
    }

    if (inBounds(vector1, point1) && inBounds(vector2, point2)) {
        return [x, y];
    } else {
        return false;
    }
}


// returns the point of intersection for two given lines
// each defined by a vector and an origin point
// returns false if the axes are parallel
export function getAxisCollision(vector1, point1, vector2, point2) {
    
    // define the first vector's rotational offset from a vertical line
    let delta = .75 - vector1.angle;

    // define a new origin point by rotating the coordinates
    // such that the first vector has a vertical angle

    let [newPoint2, newVector2] = rotateAroundPoint(point2, vector2, point1, delta);

    // then shift the coordinates over such that the first point
    // represents the line Y axis
    newPoint2[0] -= point1[0];

    let intercept = getYIntercept(newVector2, newPoint2);

    if (intercept === false) {
        return false;
    }

    // shift the intercept value by the y offset of point 1
    intercept -= point1[1];

    // then define a new vector with this magnitude, rotating
    // back to match the original angle of vector1

    let collision = new Vector2(0, intercept);
    collision.rotate(-delta);

    // then return the offset of this vector applied to the original point

    return collision.add(...point1).coordinates;
}



// return the Y Intercept value for a line defined by:
//      a vector's angle intersecting a given point
// returns false if the angle is vertical
export function getYIntercept(vector, point, offset=[0, 0]) {
    let [x, y] = point;
    let [ox, oy] = offset;
    x -= ox;
    y -= oy;

    if (!vector.x) {
        return false;
    }

    if (vector.y === 0) {
        return y;
    }

    let slope = vector.y / vector.x;

    return (y - (slope * x));
}