import { engine, GltfContainer, Transform } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";

const locations = [
    // pidgeon.ref.001
    {
        position: Vector3.create(4.963, 17.275, 10.278),
        rotation: Quaternion.fromEulerDegrees(0, 110, 0),
        scale   : Vector3.One()
    },
    // pidgeon.ref.002
    {
        position: Vector3.create(20.668, 20.079, 30.195),
        rotation: Quaternion.fromEulerDegrees(0, 220, 0),
        scale   : Vector3.One()
    },
    // pidgeon.ref.003
    {
        position: Vector3.create(17.183, 6.321, 2.487),
        rotation: Quaternion.fromEulerDegrees(0, 20, 0),
        scale   : Vector3.One()
    },
]


export function SpawnBirds() {
	for (const location of locations) {
		const entity = engine.addEntity()
		Transform.create(entity, {
			position: location.position,
			rotation: location.rotation,
			scale: location.scale
		})
		GltfContainer.create(entity, {
			src: "assets/models/pidgeon.01.gltf",
		})
	}
}