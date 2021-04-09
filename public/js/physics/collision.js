import { Rect } from "../geometry.js";

export class Collision {
    constructor(entity) {
        this.entity = entity;
        this._rect = new Rect(0, 0, 50, 50);
    }

    get rect() {
        this._rect.setCenter(...this.entity.position);
        return this._rect;
    }
}