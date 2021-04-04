function entityPropertyGetter(name) {
    return (entity) => {
        return entity[name];
    }
}

function componentPropertyGetter(component, name) {
    return (entity) => {
        return entity[component][name];
    }
}

//
// Graphical Shape Debugging
//

function getShapeGraphicsUpdate(layer, getShape, getEntities) {
    return () => {
        layer.graphics.shapes = getEntities().map(e => getShape(e));
    }
}

function getCircleArg(getPosition, radius) {
    return (entity) => {
        return {radius, position: getPosition(entity)};
    }
}

function getVectorArg(getVector, getOffset=false, scale=1) {
    return (entity) => {
        let arg = {};

        if (scale === 1) {
            arg.vector = getVector(entity);
        } else {
            arg.vector = getVector(entity).getCopy().scale(scale);
        }

        if (getOffset) {
            arg.position = getOffset(entity);
        }

        return arg;
    }
}

//
// Text Value Debugging
//

function getIntervalSetText(entity, getValue, interval) {
    let frames = 0;

    return () => {

        if (frames === 0) {
            entity.graphics.setText(
                formatValue(getValue())
            );
        }

        frames++;
        frames = frames % interval;
    }
}


function getValueAverager(getValue, cacheSize) {
    let cache = [];

    return () => {
        let value = getValue();

        if (cache.length > cacheSize) {
            cache = cache.slice(1);
        }

        cache.push(value);
        return getAverage(cache);
    }
}


function getAverage(cache) {
    let sum = 0;
    cache.forEach(v => {
        sum += v;
    });

    return sum / cache.length;
}


// expects value to be number, string, boolean, null, or array of those types
function formatValue(value) {
    if (Array.isArray(value)) {
        return value.map(v => formatValue(v)).toString();
    }

    if (typeof(value) === 'number') {
        if (!Number.isInteger(value)) {
            return value.toFixed(2);
        } else {
            return value.toString();
        }
    }

    return value.toString();
}

let debug;

export default debug = {
    formatValue,
    getAverage,
    getValueAverager,
    getIntervalSetText,
    getCircleArg,
    getVectorArg,
    getShapeGraphicsUpdate,
    entityPropertyGetter,
    componentPropertyGetter
}