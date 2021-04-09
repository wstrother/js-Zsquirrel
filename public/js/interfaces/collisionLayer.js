import { getBasisVectorsInDirection, scaleVectorInDirection } from "../geometry.js";
import { getAxisCollision, getVectorCollision, getYIntercept, Wall } from "../physics/vectorCollision.js";
import { CollisionSystem, spriteRectCollision, adjustSpriteRects } from "../physics/collision/collisionSystem.js";
import controls from './methods/controls.js';
import debug from './methods/debug.js';
import components from "./methods/components.js";
import make from './methods/make/entities.js';
import { Collision } from "../physics/collision.js";


export class CollisionLayerInterface {
    constructor(context) {
        this.context = context;

        this.origin = [0, 0]
    }
    
    setOrigin(x, y) {
        this.context.model.set('origin_offset', [x, y]);
        this.origin = [x, y];
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

    addWallCollision(layer, targets, walls) {
        // layer.addComponent('collisions', new CollisionSystem(layer));
        // layer.collisions.setCollisionSystem(
        //     () => walls.entities,
        //     testVelWithWall,
        //     adjustVelWithWall,
        //     () => targets.entities
        // );
    }

    addSpriteCollision(layer, group) {
        components.addToGroup(group, 'collision', Collision);
        layer.addComponent('collisions', new CollisionSystem(layer));
        
        layer.collisions.entities = group.entities;
        layer.collisions.test = spriteRectCollision;

        layer.events.listen('collision', (e1, e2) => {
            adjustSpriteRects(e1, e2);
        });
    }

    trackCollisionShapes(parentLayer, group, color) {
        let layer = make.addShapesLayer(
            `Debug Collision Layer (color: '${color}')`,
            parentLayer,
            color
        );
        this.context.model.set(layer.name, layer);
        
        layer.updateMethods.push(
            debug.getShapesUpdate(
                layer,
                () => group.entities.map(e => e.collision.rect)
            )
        );
    }

    addVectorControls(entity, controller, speed, other) {
        const vectorControl = (dx, dy) => {
            entity.face.rotate(dx * (speed / 300));

            entity.face.setMagnitude(
                entity.face.magnitude + (-dy * speed)
            );
        }

        const revolveVector = dx => {
            entity.rotateAroundPoint(this.origin, dx * 0.005)
            other.rotateAroundPoint(this.origin, dx * 0.005)
        }

        const A = (c) => controls.buttonHeld(c, 'A');
        const start = (c) => controls.buttonHeld(c, 'start');

        controls.setControls(
            entity, controller,

            controls.mapUdlrConditional(
                (dx, dy) => entity.move(dx * speed, dy * speed),
                (c) => !A(c) && !start(c)
            ),
        
            controls.mapUdlrConditional(
                vectorControl,
                A),
            
            controls.mapUdlrConditional(
                revolveVector,
                start
            )
        );
    }

    setBasisVectorSprites(angle) {
        let group = this.context.getValue("Walls Group");

        let [i, j] = group.entities;

        let [newI, newJ] = getBasisVectorsInDirection(angle);
        i.face.setAngle(newI.angle);
        j.face.setAngle(newJ.angle);
    }

    addTransformControls(entity, controller, speed, other) {
        entity.events.listen('spawn', () => this.setBasisVectorSprites(entity.face.angle));

        const vectorControl = (dx, dy) => {
            entity.face.rotate((dx * speed) / 32);
            this.setBasisVectorSprites(entity.face.angle);

            entity.face.setMagnitude(
                entity.face.magnitude + (-dy * speed)
            );
        }

        const revolveVector = dx => {
            other.face.rotate(dx * 0.005)
        }

        const transformVector = () => {
            scaleVectorInDirection(
                other.face, 
                entity.face.angle,
                entity.face.magnitude / 50
            );
        }

        const A = (c) => controls.buttonHeld(c, 'A');
        const start = (c) => controls.buttonHeld(c, 'start');

        controls.setControls(
            entity, controller,

            controls.mapUdlrConditional(
                (dx, dy) => other.move(dx * speed, dy * speed),
                A
            ),
        
            controls.mapUdlrConditional(
                vectorControl,
                (c) => !A(c) && !start(c),
                true),
            
            controls.mapUdlrConditional(
                revolveVector,
                start),
            
            controls.mapButton(
                'S', transformVector)
        );
    }

    reportIntersections(entity, entity2) {
        Object.entries({
            y_intercept: () => getYIntercept(
                entity.face, entity.position, this.origin),
            
            axis_collision: () => getAxisCollision(
                entity.face, entity.position,
                entity2.face, entity2.position),

            vector_collision: () => getVectorCollision(
                entity.face, entity.position,
                entity2.face, entity2.position)

        }).forEach(([key, method]) => {
            entity.updateMethods.push(debug.getModelSetter(
                this.context.model, key, method
            ));
        });
    }

    reportTransformation(entity, other) {
        Object.entries({
            scalar_value: () => entity.face.magnitude / 50,
            
            scalar_angle: () => entity.face.angle,

            target_vector: () => other.face.coordinates,

            target_magnitude: () => other.face.magnitude,

        }).forEach(([key, method]) => {
            entity.updateMethods.push(debug.getModelSetter(
                this.context.model, key, method
            ));
        });
    }
}