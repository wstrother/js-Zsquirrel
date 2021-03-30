import { Context } from "./context.js";
import { Screen } from "./graphics.js";
import { ResourceManager } from "./resources.js";
import { SpriteGraphicsInterface } from "./interfaces/spriteGraphics.js";
import { GameControllerInterface } from './interfaces/gameController.js';
import { GameDebugInterface } from './interfaces/gameDebug.js';
import { Controller } from './controller/controller.js';
import { EntityBehaviorInterface } from "./interfaces/entityBehavior.js";

const app = new PIXI.Application();
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

document.body.appendChild(app.view);

let LOG_DT = false;

const toggleDtLog = () => {
    LOG_DT = !LOG_DT;
}

document.getElementById('dt').addEventListener('click', toggleDtLog);

class Game {
    constructor(screen, environment, context, fps = 60) {
        this.screen = screen;
        this.environment = environment;
        this.interval = 1000 / fps;
        this.lastTime = 0;
        this.accTime = 0;
        this.context = context;
    }

    update(time) {
        this.context.model.set('dt', app.ticker.elapsedMS);
        if (LOG_DT) {
            console.log(app.ticker.elapsedMS);
        }

        // update top level entities
        let entities = this.environment.entities.filter(
            entity => !entity.layer
        );

        entities.forEach(entity => {
            if (!entity.paused) {
                entity.update(time);
            }
        });

        this.screen.draw(entities);
    }
}


class Environment {
    constructor(entities) {
        this.entities = entities;
    }
}

const envContext = new Context(
    [
        SpriteGraphicsInterface,
        EntityBehaviorInterface,
        GameControllerInterface,
        GameDebugInterface
    ],
    [
        Controller
    ]
);

envContext.loadEnvironment(
    'environments/main.json', 
    new ResourceManager(app.loader)
).then(entities => {
    console.log(entities);
    
    const env = new Environment(entities);
    const scr = new Screen(app.stage);
    const game = new Game(scr, env, envContext);

    app.ticker.add(time => {
        game.update(time);
    })
});