import * as utils from "@dcl-sdk/utils";
import { EasingFunction, engine, Entity, GltfContainer, Transform, Tween } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";

const positions = [
	
	// Top Floor
	{
		papIndex: 3,
		position: Vector3.create(13.386, 16.209, 28.963),
		rotation: Quaternion.fromEulerDegrees(0, -90, 0)
	},
	{
		papIndex: 4,
		position: Vector3.create(18.613, 16.209, 28.963),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0)
	},


	// Mid balcony
	{
		papIndex: 1,
		position: Vector3.create(10.545, 13.412, 24.66),
		rotation: Quaternion.fromEulerDegrees(0, -90, 0)
	},
	{
		papIndex: 2,
		position: Vector3.create(20.885, 13.412, 24.461),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0)
	},
	{
		papIndex: 2,
		position: Vector3.create(11.914, 13.412, 24.134),
		rotation: Quaternion.fromEulerDegrees(0, -90, 0)
	},
	{
		papIndex: 3,
		position: Vector3.create(20.1889, 13.412, 24.122),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0)
	},
	{
		papIndex: 3,
		position: Vector3.create(12.327, 13.412, 25.071),
		rotation: Quaternion.fromEulerDegrees(0, -90, 0)
	},
	{
		papIndex: 4,
		position: Vector3.create(19.716, 13.412, 24.909),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0)
	},



	// Bottom floor
	{
		papIndex: 1,
		position: Vector3.create(12.209, 10, 19.884),
		rotation: Quaternion.fromEulerDegrees(0, -90, 0)
	},
	{
		papIndex: 2,
		position: Vector3.create(19.791, 10, 19.884),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0)
	},
	{
		papIndex: 3,
		position: Vector3.create(11.612, 10, 18.456),
		rotation: Quaternion.fromEulerDegrees(0, -90, 0)
	},
	{
		papIndex: 4,
		position: Vector3.create(20.388, 10, 18.456),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0)
	},


	// Junction
	{
		papIndex: 2,
		position: Vector3.create(11.612, 10, 14),
		rotation: Quaternion.fromEulerDegrees(0, -135, 0)
	},
	{
		papIndex: 1,
		position: Vector3.create(20.388, 10, 14),
		rotation: Quaternion.fromEulerDegrees(0, 135, 0)
	},
	
]

const entities: Entity[] = []

export function SpawnPaparazzi(indexes?: number[]) {
	console.log("SpawnPaparazzi")
	for (const [index, spot] of positions.entries()) {
		if (indexes && !indexes.includes(index)) continue
		console.log("SpawnPaparazzi: Spawning paparazzi at position", index, spot.position.x, spot.position.y, spot.position.z)
		const entity = engine.addEntity()
		Transform.create(entity, {
			position: spot.position,
			rotation: spot.rotation,
			scale: Vector3.Zero()
		})
		GltfContainer.create(entity, {
			src: `assets/models/pap/paparazzi0${spot.papIndex}.gltf`,
		})
		entities.push(entity)

		// Spawn them after a short delay
		utils.timers.setTimeout(() => {
			Tween.setScale(entity, Vector3.Zero(), Vector3.One(), 400, EasingFunction.EF_EASEBACK)
		}, 150 + (index * 150))
	}
}

export function DestroyPaparazzi() {
	for (const [index, entity] of entities.entries()) {
		
		// Spawn them after a short delay
		utils.timers.setTimeout(() => {
			utils.timers.setTimeout(() => {
				engine.removeEntity(entity)
			}, 1000)
			Tween.setScale(entity, Vector3.One(), Vector3.Zero(), 400, EasingFunction.EF_EASEBACK)
		}, (index * 150))
	}
}