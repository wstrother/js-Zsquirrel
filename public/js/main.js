
import { Screen } from './graphics.js';
import { Context } from "./context.js";
import { SpriteGraphicsInterface } from "./interfaces/spriteGraphics.js";
import { GameControllerInterface } from './interfaces/gameController.js';
import { GameDebugInterface } from './interfaces/gameDebug.js';
import { Controller } from './controller/controller.js';


class Game {
    constructor(screen, environment, context, fps = 60) {
        this.screen = screen;
        this.environment = environment;
        this.interval = 1000 / fps;
        this.lastTime = 0;
        this.context = context;
    }

    update(time) {
        let dt = time - this.lastTime;
        this.lastTime = time;
        this.context.model.set('dt', dt);

        // update entities
        this.environment.entities.forEach(entity => {
            if (!entity.paused) {
                entity.update(dt);
            }
        });

        // draw entities to screen
        if (dt >= 0) {
            this.screen.draw(this.environment.entities);
        }
        
        // initiatie game loop
        window.requestAnimationFrame(time => {
            this.update(time);
        });
    }
}


class Environment {
    constructor(entities) {
        this.entities = entities;
    }
}


// main routine

const canvas = document.getElementById('screen');

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

envContext.loadEnvironment("environments/animation.json").then(entities => {
    const env = new Environment(entities);
    const scr = new Screen(canvas);
    const game = new Game(scr, env, envContext);

    console.log(envContext.model);

    window.requestAnimationFrame(time => {
        game.update(time);
    });

});
