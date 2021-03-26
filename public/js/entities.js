import { Vector2 } from './geometry.js';
import { LayerGraphics } from './graphics.js';

export class Entity {
    constructor(name) {
        this.name = name;

        this.layer = null;
        this.group = null;
        this._position = new Vector2(0, 0);
    }

    get position() {
        return this._position.coordinates;
    }

    setPosition(...position) {
        this._position.set(...position);
    }

    setLayer(layer) {
        this.layer = layer;
        layer.addEntity(this);
    }

    setGroup(group) {
        this.group = group;
        group.addEntity(this);
    }

    move(...args) {
        this._position.change(...args);
    }

    update() {
    }   
}

export class Layer extends Entity {
    constructor(name) {
        super(name);

        this._size = new Vector2(0, 0);
        this.entities = [];
        this.graphics = new LayerGraphics(this);
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    addGroup(group) {
        group.callOnEntities(entity => {
            entity.setLayer(this);
        })
    }

    setGroups(groups) {
        groups.forEach(group => {
            this.addGroup(group);
        });
    }

    get size() {
        return this._size.coordinates;
    }

    setSize(...size) {
        this._size.set(...size);

        if (this.graphics) {
            this.graphics.setSize(...size);
        }
    }
}

export class Group {
    constructor(name) {
        this.name = name;
        this.entities = []
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    callOnEntities(callback) {
        this.entities.forEach(callback);
    }
}