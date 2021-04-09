

export function getRectCollision(rect1, rect2) {
    let collision = false;
    rect1.corners.filter(point => pointInRect(point, rect2))
        .forEach(b => {
            if (b) {
                collision = true;
            }
        });
    return collision;
}


export function pointInRect([x, y], rect) {
    let [t, l, r, b] = rect.tlrb;

    let xbound = l <= x && x <= r;
    let ybound = t <= y && y <= b;

    return xbound && ybound;
}