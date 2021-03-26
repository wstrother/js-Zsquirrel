const FRAME_DEPTH = 25;

export class Controller {
    constructor(name, frameDepth=FRAME_DEPTH) {
        this.name = name;
        this.devices = new Map();

        this.frames = new FrameCache(frameDepth)
    }

    addDevice(device) {
        device.setController(this);
        this.devices.set(device.name, device);
        this.frames.addDevice(device);
    }

    getDeviceFrames(deviceName) {
        return this.frames.getDeviceFrames(deviceName);
    }

    update() {
        
        // update the frame cache for each device's current input
        this.frames.update();

        // each device updates it's state based on the updated frame data
        this.devices.forEach(device => {
            device.update();
        });

        // console.log(this.devices[0].getValue());
    }

}

class FrameCache {
    constructor(frameDepth) {
        this.devices = [];
        this.frames = new Map();
        this.frameDepth = frameDepth;        
    }

    addDevice(device) {
        this.devices.push(device);
        this.frames.set(device.name, []);
    }

    update() {
        this.devices.forEach(device => {
            this.setDeviceFrames(device);
        });
    }

    getDeviceFrames(deviceName) {
        return this.frames.get(deviceName);
    }

    setDeviceFrames(device) {
        const currentFrame = device.getInput();
        const frames = this.frames.get(device.name);

        if (frames.length >= this.frameDepth) {
            frames.pop(0);
        }

        frames.push(currentFrame);
    }

}