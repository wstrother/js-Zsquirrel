import { Entity, Group, Layer } from "./entities.js";
import { ResourceLoader } from "./resources.js";

export class Context {
    constructor(interfaces) {
        this.environment = null;
        this.interfaces = new Map();
        interfaces.forEach(i => {
            this.interfaces.set(i.name, new i(this));
        });

        this.model = new Map();
        this.resourceLoader = new ResourceLoader();
        this.EnvironmentLoader = new EnvironmentLoader(this);
    }

    clearModel() {
        this.model = new Map();
    }

    updateModel(newData) {
        newData.forEach((value, key) => {
            this.model.set(key, value);
        });
    }

    // populate function parses json, instantiates entities and applies
    // setter values and components based on application interface methods
    async loadEnvironment(name) {
        let {url} = this.resourceLoader.getResource(name);

        const { resource } = await this.resourceLoader.loadJson(name, url);
        return this.EnvironmentLoader.populate(resource);
    }
}


class EnvironmentLoader {
    constructor(context) {
        this.context = context;
        this.entities = [];
    }

    getValue(value) {
        if (typeof(value) === 'string') {
            if (this.context.model.has(value)) {
                return this.context.model.get(value);
            }
        }

        return value;
    }

    populate(envJson) {
        // search for fileNames and queue them in resource loader
        parseObject(envJson, this.context);

        return this.context.resourceLoader.loadAll().then(resourceMap => {
            // add loaded resources to the model
            this.context.updateModel(resourceMap);

            // then add Entity instances
            this.createGroups(envJson.groups);
            this.createLayers(envJson.layers);
            this.createEntities(envJson.entities);

            const allEntities = envJson.layers.concat(envJson.entities);

            // then call setAttribute methods on entities
            allEntities.forEach(data => {

                let entity = this.context.model.get(data.name);
                this.setEntityAttributes(entity, data);
                this.setInterfaceMethods(entity, data);

            });

            return this.entities;
        });
    }

    createGroups(groups) {
        groups.forEach(data => {
            const newGroup = new Group(data.name);
            this.context.model.set(data.name, newGroup);
        })
    }

    createEntities(entities) {
        entities.forEach(data => {
            const newEntity = new Entity(data.name);
            this.context.model.set(data.name, newEntity);
            this.entities.push(newEntity);
        });
    }

    createLayers(layers) {
        layers.forEach(data => {
            const newLayer = new Layer(data.name);
            this.context.model.set(data.name, newLayer);
            this.entities.push(newLayer);
        });
    }

    getArgs(value) {
        let args;
        if (!Array.isArray(value)) { args = [value]; }
        else { args = value; }

        // replace arguments with values from model where
        // there is a matching key and return args as array
        // that can be expanded
        return args.map(arg => this.getValue(arg));
    }

    setEntityAttributes(entity, data) {
        // checks entity for 'setKey' method for each key in entity data
        Object.entries(data).forEach(([key, value]) => {
            let setAttr = 'set' + key.charAt(0).toUpperCase() + key.slice(1)
            
            if (setAttr in entity) {
                entity[setAttr](...this.getArgs(value));
            }
        });
    }

    setInterfaceMethods(entity, data) {
        Object.entries(data).forEach(([name, iData]) => {
            if (this.context.interfaces.has(name)) {
                let i = this.context.interfaces.get(name);

                Object.entries(iData).forEach(([methodName, args]) => {
                    i[methodName](entity, ...this.getArgs(args));
                });
            }
        });
    }
}

function handleFileName(item, context) {
    let {fileType} = context.resourceLoader.getResource(item);

    if (fileType) {
        context.resourceLoader.addResource(item);
    }
}

function parseItem(item, context) {
    if (typeof(item) === 'object') {

        if (Array.isArray(item)) {
            return parseArray(item, context);
        } else {
            return parseObject(item, context);
        }
    } else {
        if (typeof(item) === 'string') {
            handleFileName(item, context);
        }
    }

}

function parseArray(item, context) {
    item.forEach(subItem => {
        parseItem(subItem, context)
    });
}

function parseObject(item, context) {
    parseArray(Object.values(item), context);
}