import { Context } from "./context.js";
import { Screen } from "./graphics.js";
import { ResourceManager } from "./resources.js";
import { SpriteGraphicsInterface } from "./interfaces/spriteGraphics.js";
import { GameControllerInterface } from './interfaces/gameController.js';
import { GameDebugInterface } from './interfaces/gameDebug.js';
import { Controller } from './controller/controller.js';

const app = new PIXI.Application();

// The application will create a canvas element for you that you
// can then insert into the DOM
document.body.appendChild(app.view);

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
        // console.log(app.ticker.elapsedMS);

        // update entities
        this.environment.entities.forEach(entity => {
            if (!entity.paused) {
                entity.update(time);
            }
        });

        this.screen.draw(this.environment.entities);
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
        GameControllerInterface,
        GameDebugInterface
    ],
    [
        Controller
    ]
);

envContext.loadEnvironment(
    'environments/newTest.json', 
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