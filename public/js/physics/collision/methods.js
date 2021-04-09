import { scaleVectorInDirection, Vector2 } from "../../geometry.js";
import { getRectCollision } from "../rectCollision.js";
import { getAxisCollision, getVectorCollision } from "../vectorCollision.js";


function testSpriteRectCollision(entity, other) {
    return getRectCollision(entity.collision.rect, other.collision.rect);
}

function adjustSpriteRectCollision(entity, other) {
    let [ex, ey, ox, oy] = [
        ...entity.collision.rect.center,
        ...other.collision.rect.center
    ];

    let adjustment = new Vector2(ex - ox, ey - oy).scale(0.01);

    entity.physics.applyForce(adjustment.getCopy());
    other.physics.applyForce(adjustment.getCopy().scale(-1));
}


const checkVectorVsWall = (vector, point, wall) => getVectorCollision(
    vector, point, wall.face, wall.position);


function checkRectCorners(test, rect, vector) {
    let collision = false;

    for (let point of rect.corners) {
        collision = test(vector, point);

        if (collision) { return collision; }
    }
}

function checkRectVsWall(rect, vector, wall, adjust) {
    let collision = checkRectCorners(
        (v, p) => checkVectorVsWall(v, p, wall),
        rect,
        vector
    );

    if (collision) {
        return adjust(collision);
    }
}

function adjustRectVsWall(vector, wall, collision) {
    let normal = wall.getNormal();
    let projected = vector.add(...collision).coordinates;

    let adjustment = getAxisCollision(normal, projected, wall.face, wall.position);

    scaleVectorInDirection(vector, wall.getNormal().angle, 0);

    return {
        adjustment,
        vector,
        wall
    };
}

export default {
    checkRectVsWall,
    adjustRectVsWall
}