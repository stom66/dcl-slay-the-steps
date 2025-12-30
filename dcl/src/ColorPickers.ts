import { engine, Entity, GltfContainer, InputAction, Material, MeshRenderer, pointerEventsSystem, PrimaryPointerInfo, RaycastQueryType, raycastSystem, Transform } from "@dcl/sdk/ecs"
import { _OutfitManager } from "./OutfitManager"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"

import * as utils from '@dcl-sdk/utils'
import { hsvToColor3 } from "./utils"

class ColorPickers {

	constructor() {
	}

	init() {
		this.CreateColorWheel("Hair", Vector3.create(8, 1.3, 1.75))
		this.CreateColorWheel("Skin", Vector3.create(1.75, 1.3, 8), Vector3.create(0, 90, 0))
	}

	private CreateColorWheel(
		title    : string, 
		position : Vector3, 
		rotation?: Vector3
	) {

		const wheelEntity = engine.addEntity()
		Transform.create(wheelEntity, {
			position: position,
			rotation: Quaternion.fromEulerDegrees(rotation?.x ?? 0, rotation?.y ?? 0, rotation?.z ?? 0)
		})
		GltfContainer.create(wheelEntity, {
			src: 'assets/models/shopZoneColorPicker.gltf'
		})
		
		pointerEventsSystem.onPointerDown(
			{ 
				entity: wheelEntity, 
				opts: { 
					button: InputAction.IA_PRIMARY,
					hoverText: "Choose " + title + " Color",
					maxDistance: 6
				} 
			},
			() => {
				this.SampleColorWheel(wheelEntity, title)
			}
		)

		// Also add the title gltf
		const titleEntity = engine.addEntity()
		Transform.create(titleEntity, {
			parent: wheelEntity
		})
		GltfContainer.create(titleEntity, {
			src: `assets/models/shopZoneColorPicker.Text${title}.gltf`
		})
	}

	// MARK: SampleHairColor
	private SampleColorWheel(
		wheelEntity: Entity,
		title      : string
	) {

		console.log("ShopManager: SampleHairColor")

		const pointerInfo = PrimaryPointerInfo.getOrCreateMutable(engine.RootEntity)
    	let dir = pointerInfo.worldRayDirection

		raycastSystem.registerGlobalDirectionRaycast({
			entity: engine.CameraEntity,
			opts: {
				queryType: RaycastQueryType.RQT_HIT_FIRST,
				direction: dir,
			},
		}, function (raycastResult) {
			let result = raycastResult.hits[0]

			//console.log("raycastResult: ", JSON.stringify(raycastResult, null, 2))

			// do something in the hit position
			if (result && result.position) {
				// Work out where the cast hit the wheel
				const worldPosition = utils.getWorldPosition(wheelEntity)
				const local = Vector3.subtract(result.position, worldPosition)
				
				// XZ plane
				const x = local.x
				const z = local.y
				
				const angle = Math.atan2(-x, z)
				
				let hue = angle / (2 * Math.PI)
				if (hue < 0) hue += 1
				
				// Radius = brightness
				const wheelRadius = 0.75 // check the model collider in blender, radius = dimensions/2
				const hitRadius = Math.min(Math.sqrt(x * x + z * z), wheelRadius)
				
				// Value is based on distance from center of the wheel

				const value = Math.min(hitRadius / wheelRadius, 1)
				
				// Final color is based on hue, saturation, and value
				const color = hsvToColor3(hue, 1, value)
				console.log("hitRadius: ", hitRadius, ", value: ", value, ", color: ", color.r, ", ", color.g, ", ", color.b)

				_OutfitManager.SetHairColor(color)


				// Make a temporary marker entity to show where the cast hit
				const markerEntity = engine.addEntity()
				Transform.create(markerEntity, {
					position: result.position,
					scale: Vector3.Zero()
				})
				MeshRenderer.setSphere(markerEntity)
				Material.setPbrMaterial(markerEntity, {
					albedoColor: Color4.fromColor3(color)
				})

				// Scale in and out the marker
				
				const markerScale = 0.1
				const markerLifespan = 250
				utils.tweens.startScaling(markerEntity, Vector3.Zero(), Vector3.create(markerScale, markerScale, markerScale), 0.1, utils.InterpolationType.LINEAR, () => {

					utils.timers.setTimeout(() => { 
						utils.tweens.startScaling(markerEntity, Vector3.create(markerScale, markerScale, markerScale), Vector3.Zero(), 0.1, utils.InterpolationType.LINEAR, () => {
							engine.removeEntity(markerEntity) 
						})
					}, markerLifespan)
				})
			}
		})
	}
}

export const _ColorPickers = new ColorPickers()