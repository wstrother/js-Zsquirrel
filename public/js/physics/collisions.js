import { Entity } from "../entities.js";
import { Vector2 } from "../geometry.js";


export class Wall extends Entity {
    constructor(name, vector) {
        super(name);

        this.face = vector;
    }

    static getFromPoints([sx, sy], [ex, ey]) {
        let x = ex - sx;
        let y = ey - sy;
        let vector = new Vector2(x, y);

        let wall = new Wall([[sx, sy], [ex, ey]].toString(), vector);
        wall.setPosition(sx, sy);

        return wall;
    }
}


// returns an array [[x, y], vector] such that if a given point
// 
function rotateAroundPoint(origin, vector, pivot, angle) {
    let [ox, oy] = origin;
    let [px, py] = pivot;

    let [dx, dy] = [ox - px, oy - py];
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

}


// returns the point of intersection for two given lines
// each defined by a vector and an origin point
// returns false if the axes are parallel
export function getAxisCollision(vector1, point1, vector2, point2) {
    let [vx1, vy1] = vector1.coordinates;
    let [vx2, vy2] = vector2.coordinates;
    let [x1, y1] = point1;
    let [x2, y2] = point2;

    debugger;

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
    intercept -= y1;

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
export function getYIntercept(vector, point) {
    let [x, y] = point;

    if (!vector.x) {
        return false;
    }

    if (vector.y === 0) {
        return y;
    }

    debugger;
    let slope = vector.y / vector.x;
    console.log(slope);

    return (y - (slope * x));
}