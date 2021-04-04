import { Entity, Group, Layer } from "./entities.js";

export class Context {
    constructor(interfaces, entityClasses) {
        this.model = new Map();

        this.interfaces = new Map();
        interfaces.forEach(i => {
            this.interfaces.set(i.name, new i(this));
        });

        entityClasses.forEach(ec => {
            this.model.set(ec.name, ec);
        });

        this.environmentLoader = new EnvironmentLoader(this);
    }

    clearModel() {
        this.model = new Map();
    }

    updateModel(newData) {
        newData.forEach((value, key) => {
            this.model.set(key, value);
        });
    }

    addEntity(entity) {
        this.model.set(entity.name, entity);
        this.environmentLoader.entities.push(entity);
    }

    getValue(value) {
        if (typeof(value) === 'string') {
            if (this.model.has(value)) {
                return this.model.get(value);
            }
        }

        return value;
    }

    // populate function parses json, instantiates entities and applies
    // setter values and components based on application interface methods
    async loadEnvironment(name, loader) {
        let {url} = loader.getResource(name);

        const json = await fetch(url).then(resp => resp.json());

        return this.environmentLoader.populate(json, loader);
    }
}


class EnvironmentLoader {
    constructor(context) {
        this.context = context;
        this.entities = [];
    }

    getValue(value) {
        return this.context.getValue(value);
    }

    populate(envJson, loader) {
        // search for fileNames and queue them in resource loader
        parseObject(envJson, loader);

        return loader.loadAll().then(resourceMap => {
            // add loaded resources to the model
            this.context.updateModel(resourceMap);

            // instantiate default data lists
            let interfaces, groups, layers, entities;
            interfaces = envJson.interfaces || {};
            groups = envJson.groups || [];
            layers = envJson.layers || [];
            entities = envJson.entities || [];

            // initialize Interface classes
            this.handleInterfaces(interfaces);

            // then add Entity and Group instances
            this.createGroups(groups);
            this.createLayers(layers);
            this.createEntities(entities);

            const allEntities = entities.concat(layers);

            // then call setAttribute methods on entities
            allEntities.forEach(data => {
                let entity = this.context.model.get(data.name);
                this.setEntityAttributes(entity, data);
            });

            // then call Interface methods on entities
            allEntities.forEach(data => {
                let entity = this.context.model.get(data.name);
                this.setInterfaceMethods(entity, data);

            });

            return this.entities;
        });
    }

    createGroups(groups) {
        groups.forEach(name => {
            if (!this.context.model.has(name)) {
                const newGroup = new Group(name);
                this.context.model.set(name, newGroup);
            }
        })
    }

    
    createEntities(entities) {
        entities.forEach(data => {
            let entClass = this.getValue(data.class) || Entity;
            
            const newEntity = new entClass(data.name);
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

    parseGroupArgs(args) {
        let groups = args.filter(arg => typeof(arg) === 'string');
        this.createGroups(groups);
    }
    
    getArgs(value, groups=false) {
        let args;
        if (!Array.isArray(value)) { args = [value]; }
        else { args = value; }

        if (groups) {
            this.parseGroupArgs(args);
        }

        // replace arguments with values from model where
        // there is a matching key and return args as array
        // that can be expanded
        return args.map(arg => this.getValue(arg));
    }

    setEntityAttributes(entity, data) {
        // checks entity for 'setKey' method for each key in entity data
        Object.entries(data).forEach(([key, value]) => {
            let setAttr = 'set' + key.charAt(0).toUpperCase() + key.slice(1)

            let groups = ['setGroup', 'setGroups'].includes(setAttr);
            
            if (setAttr in entity) {
                entity[setAttr](...this.getArgs(value, groups));
            }
        });
    }

    setInterfaceMethods(entity, data) {
        Object.entries(data).forEach(([name, iData]) => {
            if (this.context.interfaces.has(name)) {
                let i = this.context.interfaces.get(name);

                Object.entries(iData).forEach(([methodName, args]) => {
                    try {
                        i[methodName](entity, ...this.getArgs(args));
                    } catch (error) {
                        if (error.message === 'i[methodName] is not a function') {
                            console.warn(`${methodName} not a method on ${name}`);
                        } else {
                            throw error;
                        }
                    }
                });
            }
        });
    }

    handleInterfaces(data) {
        Object.entries(data).forEach(([name, iData]) => {
            if (this.context.interfaces.has(name)) {
                let i = this.context.interfaces.get(name);

                Object.entries(iData).forEach(([methodName, args]) => {
                    i[methodName](...this.getArgs(args));
                });
            }
        })
    }
}

function handleFileName(item, loader) {
    let {fileType} = loader.getResource(item);

    if (fileType) {
        loader.addResource(item);
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