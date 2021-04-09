import { Timer } from "./meters.js";

export class EventEmitter {
    constructor(entity) {
        this.entity = entity;
        this.listeners = [];
        this.timers = [];
    }

    listen(name, callback) {
        const listener = {name, callback};
        this.listeners.push(listener);
    }

    emit(name, ...args) {
        this.listeners.forEach(listener => {
            if (listener.name === name) {
                listener.callback(...args);
            }
        });
    }

    setEventHook(methodName, ...outerArgs) {
        const method = this.entity[methodName].bind(this.entity);

        this.entity[methodName] = (...innerArgs) => {
            method(...innerArgs);
            this.emit(methodName, ...outerArgs, ...innerArgs);
        }
    }

    queue(name, duration, args=[], lerp=true) {
        let timer = new Timer(duration, name);
        this.timers.push(timer);
        
        if (lerp) {
            timer.onTick = (timer) => this.emit(name, timer, ...args);
        } else {
            timer.onDone = (timer) => this.emit(name, timer, ...args);
        }
    }

    queueEvents(event, ...rest) {
        if (event.lerp === undefined) {
            event.lerp = true;
        }
        
        this.queue(
            event.name,
            event.duration || 1,
            event.args || [],
            event.lerp
        );

        const chainEvents = (event, ...rest) => {
            let last = this.timers[this.timers.length - 1];
            let onDone = last.onDone;

            last.onDone = (...args) => {
                if (onDone) {
                    onDone(...args);
                }

                this.queueEvents(event, ...rest);
            }
        }

        if (rest.length >= 1) {
            chainEvents(...rest);
        }
    }

    update() {
        let i = 0;

        this.timers.forEach(timer => {
            timer.tick();
            if (timer.value === 0) {
                this.timers.shift();
            }

            i++;
        });
    }
}