import { vec3 } from "gl-matrix";
import { System } from "white-dwarf/ecsy";
import { TransformData3D } from "white-dwarf/src/Core/Locomotion/DataComponent/TransformData3D";
import { EulerVelocityData3D } from "white-dwarf/src/Core/Physics/DataComponents/EulerVelocityData3D";
import { MassData } from "../DataComponent/MassData";

const G = 6.67408e-11;

export class EulerVelocityPlanetGravitySystem extends System {
  static queries = {
    entities: {
      components: [TransformData3D, EulerVelocityData3D, MassData],
    },
  };

  execute(delta: number, time: number): void {
    const entities = this.queries.entities.results;

    entities.forEach((entity) => {
      const transform1 = entity.getComponent(
        TransformData3D
      ) as TransformData3D;
      const targetVelocity = entity.getMutableComponent(
        EulerVelocityData3D
      ) as EulerVelocityData3D;
      const massData = entity.getComponent(MassData) as MassData;

      let force: vec3 = vec3.create();

      entities.forEach((entity2) => {
        if (entity2.id === entity.id) return;

        const transform2 = entity2.getComponent(
          TransformData3D
        ) as TransformData3D;
        const massData2 = entity2.getComponent(MassData) as MassData;

        const distance = vec3.distance(
          transform1.position.value,
          transform2.position.value
        );

        const forceMagnitude = (G * massData.mass * massData2.mass) / distance;

        const direction = vec3.create();
        vec3.sub(
          direction,
          transform2.position.value,
          transform1.position.value
        );
        vec3.normalize(direction, direction);

        vec3.scaleAndAdd(force, force, direction, forceMagnitude);
      });

      const acceleration = vec3.create();
      vec3.scale(acceleration, force, 1 / massData.mass);

      vec3.scaleAndAdd(
        targetVelocity.velocity.value,
        targetVelocity.velocity.value,
        acceleration,
        delta
      );
    });
  }
}
