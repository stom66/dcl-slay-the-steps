import * as utils from "@dcl-sdk/utils";
import { EasingFunction, engine, Entity, GltfContainer, GltfContainerLoadingState, LoadingState, Tags, Transform, Tween } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";

import { GameStatus, TAGS } from "src/shared/enums";
import { eventBus } from "src/shared/utils/eventBus";
import { ClientEvents } from "src/client/clientEvents";


// MARK: Event bindings

eventBus.on(ClientEvents.NOTIFY_STATE, (data) => {
	if (data.serverStatus == GameStatus.GAME_ENDED || data.serverStatus == GameStatus.LOBBY) {
		DestroyPaparazzi()
	}
})


// MARK: Vars
const defaultScale = Vector3.create(0.85, 0.85, 0.85)
const positions = [
	
	// Top Floor
	{
		papIndex: 2,
		position: Vector3.create(13.41, 16.22, 27.73),
		rotation: Quaternion.fromEulerDegrees(0, -110, 0),
		scale: Vector3.create(0.65, 0.65, 0.65)
	},
	{
		papIndex: 1,
		position: Vector3.create(18.59, 16.22, 27.73),
		rotation: Quaternion.fromEulerDegrees(0, 110, 0),
		scale: Vector3.create(0.65, 0.65, 0.65)
	},


	// Mid balcony
	{
		papIndex: 1,
		position: Vector3.create(10.545, 13.412, 24.66),
		rotation: Quaternion.fromEulerDegrees(0, -90, 0)
	},
	{
		papIndex: 2,
		position: Vector3.create(21.5, 13.412, 24.461),
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
		position: Vector3.create(19.9, 13.412, 24.909),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0)
	},



	// Bottom floor
	{
		papIndex: 1,
		position: Vector3.create(12.209, 10, 19.884),
		rotation: Quaternion.fromEulerDegrees(0, -60, 0)
	},
	{
		papIndex: 2,
		position: Vector3.create(19.791, 10, 19.884),
		rotation: Quaternion.fromEulerDegrees(0, 60, 0)
	},
	{
		papIndex: 3,
		position: Vector3.create(11.612, 10, 18.456),
		rotation: Quaternion.fromEulerDegrees(0, -80, 0)
	},
	{
		papIndex: 4,
		position: Vector3.create(20.388, 10, 18.456),
		rotation: Quaternion.fromEulerDegrees(0, 80, 0)
	},


	// Junction
	{
		papIndex: 2,
		position: Vector3.create(11.612, 10, 14),
		rotation: Quaternion.fromEulerDegrees(0, -60, 0)
	},
	{
		papIndex: 1,
		position: Vector3.create(20.388, 10, 14),
		rotation: Quaternion.fromEulerDegrees(0, 60, 0)
	},
	
]

var timeouts  : utils.TimerId[] = []


// MARK: SpawnPaparazzi
export function SpawnPaparazzi(
	indexes : number[] = [...Array(positions.length).keys()], 
	delay   : number   = 0, 
	interval: number   = 150,
	duration: number   = 400
) {
	console.log("SpawnPaparazzi")
	var cumulativeDelay = interval
	for (const [index, spot] of positions.entries()) {
		if (indexes && !indexes.includes(index)) continue

		//console.log("SpawnPaparazzi: Spawning paparazzi at position", index, spot.position.x, spot.position.y, spot.position.z)
		// Spawn them in at scale.Zero()
		const entity = engine.addEntity()
		Tags.add(entity, TAGS.PAPARAZZI)
		Transform.create(entity, {
			position: spot.position,
			rotation: spot.rotation,
			scale: Vector3.Zero()
		})
		GltfContainer.create(entity, {
			src: `assets/models/pap/paparazzi0${spot.papIndex}.gltf`,
		})

		const thisDelay = cumulativeDelay - delay
		GltfContainerLoadingState.onChange(entity, (state) => {
			if (state?.currentState === LoadingState.FINISHED) {
				timeouts.push(utils.timers.setTimeout(() => {
					Tween.setScale(entity, Vector3.Zero(), spot.scale || defaultScale, duration, EasingFunction.EF_EASEBACK)
				}, thisDelay))
			}
		})

		cumulativeDelay += interval
	}
}


// MARK: DestroyPaparazzi

// Note: We can't selectively de-spawn entities.
// Despawn will remove all entities
// So we can't, spawn a group, then a second group, and selectively remove the first group
// Not a problem for the current setup, but might need fixing later
export function DestroyPaparazzi(
	interval: number = 150, 
	duration: number = 400
) {
	console.log("DestroyPaparazzi")

	// Clear any existing timeouts
	for (const timeout of timeouts) {
		utils.timers.clearTimeout(timeout)
	}
	timeouts = []

	// copy the array of entities and clear the original
	const toDestroy = engine.getEntitiesByTag(TAGS.PAPARAZZI)
	let index = 0
	for (const entity of toDestroy) {
		// Tween to scale.Zero() and remove the entity after a short delay
		timeouts.push(utils.timers.setTimeout(() => {
			// Ensure the entity still exists
			const t = Transform.getOrNull(entity)
			if (!t) return
			Tween.setScale(entity, t.scale, Vector3.Zero(), duration, EasingFunction.EF_EASEBACK)

			timeouts.push(utils.timers.setTimeout(() => {
				// Ensure the entity still exists
				const t = Transform.getOrNull(entity)
				if (!t) return
				engine.removeEntity(entity)
			}, duration + 500))
		}, (index * interval)))
		index += 1
	}
}
