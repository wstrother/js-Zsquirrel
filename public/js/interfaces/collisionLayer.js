
import { Wall } from "../physics/collisions.js";


export class CollisionLayerInterface {
    constructor(context) {
        this.context = context;
    }

    addWalls(layer, ...walls) {
        this.context.environmentLoader.createGroups(["Walls Group"]);
        let wallsGroup = this.context.getValue("Walls Group");

        walls.forEach(([start, end]) => {
            let wall = Wall.getFromPoints(start, end);

            wall.setGroup(wallsGroup);
        })

        layer.setGroups(wallsGroup);
    }
}