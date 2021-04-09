import { EventEmitter } from './events.js';
import { Vector2 } from './geometry.js';
import { LayerGraphics } from './graphics.js';


export class Entity {
    constructor(name) {
        this.name = name;

        this.visible = true;
        this.paused = false;
        this.spawned = false;

        this.layer = null;
        this.group = null;
        this._position = new Vector2(0, 0);

        this.updateMethods = [];
        
        this._components = [];
        this._componentUpdates = new Map();

        this.addComponent('events', new EventEmitter(this));
    }

    addComponent(name, component, replace=false) {
        if (this[name] && !replace) {
            throw Error(`${this.name} already has a component called ${name}`);
        }
        
        this.removeComponent(name);
        this._components.push(name);
        this[name] = component;

        if (component['update']) {
            let method = (...args) => { component.update(...args); }

            this.updateMethods.push(method);
            this._componentUpdates.set(name, method);
        }
    }

    removeComponent(name) {
        if (this[name] && !this._components.includes(name)) {
            throw Error(`${this.name}.${name} is not a component`);
        }

        delete this[name];
        if (this._componentUpdates.has(name)) {
            let method = this._componentUpdates.get(name);
            this.updateMethods.pop(
                this.updateMethods.findIndex(m => m === method)
            );
            this._componentUpdates.delete(name);
        }
    }

    setVisible(bool) {
        this.visible = bool;
    }

    setPaused(bool) {
        this.paused = bool;
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
        this._position.move(...args);
    }

    update(...args) {
        if (!this.spawned) {
            this.spawned = true;
            this.events.emit('spawn', this);
        }

        this.updateMethods.forEach(method => {
            method(...args);
        });
    }   
}

export class Layer extends Entity {
    constructor(name) {
        super(name);

        this._size = new Vector2(0, 0);
        this._scale = new Vector2(1, 1);
        this.entities = [];
        this.addComponent('graphics', new LayerGraphics(this));
    }
    
    addEntity(entity) {
        this.entities.push(entity);
    }

    addGroup(group) {
        group.callOnEntities((entity) => {
            entity.setLayer(this);
        });
    }

    setGroups(...groups) {
        groups.forEach(group => {
            this.addGroup(group);
        });
    }

    get size() {
        return this._size.coordinates;
    }

    setSize(...size) {
        this._size.set(...size);
    }

    get scale() {
        return this._scale.coordinates;
    }

    setScale(sx, sy) {
        this._scale.set(sx, sy);
    }

    update(...args) {
        // update entities first
        this.entities.filter(entity => !entity.paused)
            .forEach(entity => entity.update(...args));
        
        // then call layer update methods
        super.update(...args);
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