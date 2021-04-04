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
}