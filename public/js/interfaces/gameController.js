import { Button } from "../controller/devices.js";
import { ButtonMappingKey, KeyboardState } from "../controller/mappings.js";

export class GameControllerInterface {
    constructor(context) {
        this.context = context;

        this.keyboard = new KeyboardState();
        this.keyboard.listenTo(window);
    }

    setControllerDevices(controller, data) {
        data.devices.forEach(deviceData => {
            controller.addDevice(
                this.getDevice(deviceData)
            );
        });
    }

    getDevice(data) {
        if (data.type === "ButtonMappingKey") {
            return new Button(
                data.name,
                new ButtonMappingKey(data.code, this.keyboard)
            );
        }
    }

    addUdlr(entity, controller, speed=1) {
        entity.updateMethods.push(() => {
            let [u, d, l, r] = ["up", "down", "left", "right"].map(d => controller.devices.get(d));
            let [dx, dy] = [0, 0];
    
            if (u.held) { dy = -speed }
            if (d.held) { dy = speed }
            if (l.held) { dx = -speed }
            if (r.held) { dx = speed }
    
            if (dx !== 0 || dy !== 0) {
                entity.move(dx, dy);
            }
        });
    }
}