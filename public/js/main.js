
import { Screen } from './graphics.js';
import { Controller } from "./controller/controller.js";
import { Button } from "./controller/devices.js";
import { KeyboardState, ButtonMappingKey } from "./controller/mappings.js";
import { Context } from "./context.js";
import { SpriteGraphicsInterface } from "./interfaces/spriteGraphics.js";


class Game {
    constructor(screen, environment) {
        this.screen = screen;
        this.environment = environment;
    }

    update() {
        // update entities
        this.environment.entities.forEach(entity => {
            // console.log(`${entity.name}`)
            // debugger;
            entity.update();
        });

        // draw entities to screen
        this.screen.draw(this.environment.entities);
        
        // initiatie game loop
        const update = () => { this.update(); }
        requestAnimationFrame(update);
    }
}


class Environment {
    constructor(entities) {
        // array of entities
        this.entities = entities;
    }
}



function setUpController(keyboard) {
    const controller = new Controller("test controller");

    const start = new Button(
        "start button", 
        new ButtonMappingKey("Space", keyboard)
    );
    const left = new Button(
        "left", 
        new ButtonMappingKey("ArrowLeft", keyboard)
    );
    const right = new Button(
        "right", 
        new ButtonMappingKey("ArrowRight", keyboard)
    );
    const up = new Button(
        "up", 
        new ButtonMappingKey("ArrowUp", keyboard)
    );
    const down = new Button(
        "down", 
        new ButtonMappingKey("ArrowDown", keyboard)
    );
    
    controller.addDevice(start);
    controller.addDevice(left);
    controller.addDevice(right);
    controller.addDevice(down);
    controller.addDevice(up);

    return controller;
}


// main routine

const canvas = document.getElementById('screen');

const keyStates = new KeyboardState();
keyStates.listenTo(window);

const envContext = new Context([
    SpriteGraphicsInterface
]);
envContext.loadEnvironment("main.json").then(entities => {

    const testController = setUpController(keyStates);
    entities.push(testController);

    const squirrelEntity = envContext.model.get("Squirrel");
    console.log(squirrelEntity);

    squirrelEntity.update = () => {
        let [u, d, l, r] = ["up", "down", "left", "right"].map(d => testController.devices.get(d));
        let [dx, dy] = [0, 0];

        if (u.held) { dy = -1 }
        if (d.held) { dy = 1 }
        if (l.held) { dx = -1 }
        if (r.held) { dx = 1 }

        squirrelEntity.move(dx, dy);
    }

    const env = new Environment(entities);
    const scr = new Screen(canvas);
    const game = new Game(scr, env);
    game.update();
});
