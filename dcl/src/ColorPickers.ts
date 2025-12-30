import { engine, Entity, GltfContainer, GltfNodeModifiers, InputAction, Material, MeshRenderer, pointerEventsSystem, PrimaryPointerInfo, RaycastQueryType, raycastSystem, Transform } from "@dcl/sdk/ecs"
import { _OutfitManager } from "./OutfitManager"
import { Color3, Color4, Quaternion, Vector3 } from "@dcl/sdk/math"

import * as utils from '@dcl-sdk/utils'
import { hsvToColor3 } from "./utils"

class ColorPickers {

	private colorPresetHexCodes: string[] = ["#FFE4C6", "#FFDDBC", "#F2C2A5", "#DDB18F", "#CC9B77", "#9A765B", "#7D5D47", "#704C38", "#522C1C", "#3C2216"]
	private interactionDistance = 8

	constructor() { }

	// MARK: Init
	init() {
		this.CreateColorWheel("Hair", Vector3.create(8, 1.92, 1.75))
		this.CreateColorWheel("Skin", Vector3.create(1.75, 1.92, 8.25), Vector3.create(0, 90, 0))
	}

	// MARK: Create Color Wheel
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
					button     : InputAction.IA_PRIMARY,
					hoverText  : "Choose " + title + " Color",
					maxDistance: this.interactionDistance
				} 
			},
			() => {
				if (title.toLowerCase() == "hair") {
					this.SampleColorWheel(wheelEntity, (color) => _OutfitManager.SetHairColor(color))
				} else {
					this.SampleColorWheel(wheelEntity, (color) => _OutfitManager.SetSkinColor(color))
				}
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

		if (title.toLowerCase() === "skin") {
			this.CreatePresetButtons(wheelEntity)
		}
	}

	// MARK: Create Color presets
	private CreatePresetButtons(parentEntity: Entity) {

		const rotStep = -22.5
		let index = 0

		for (const hexCode of this.colorPresetHexCodes) {

			const color = Color3.fromHexString(hexCode)

			const buttonEntity = engine.addEntity()
			const parentTransform = Transform.getOrNull(parentEntity)
			if (!parentTransform) return

			const parentRot   = Quaternion.toEulerAngles(parentTransform.rotation)
			const elementRot  = Vector3.create(0, 0, rotStep * index)
			const combinedRot = Vector3.add(parentRot, elementRot)

			Transform.create(buttonEntity, {
				position: parentTransform.position,
				rotation: Quaternion.fromEulerDegrees(combinedRot.x, combinedRot.y, combinedRot.z)
			})
			GltfContainer.create(buttonEntity, {
				src: `assets/models/shopZoneColorPickerBtn.gltf`
			})

			pointerEventsSystem.onPointerDown(
				{ 
					entity: buttonEntity, 
					opts: { 
						button     : InputAction.IA_PRIMARY,
						hoverText  : "Choose Color",
						maxDistance: this.interactionDistance
					} 
				},
				() => {
					_OutfitManager.SetSkinColor(color)
				}
			)

			GltfNodeModifiers.create(buttonEntity, {
				modifiers: [
					{
						path: 'tint',
						material: {
							material: {
								$case: 'pbr',
								pbr: {
									albedoColor: Color4.fromColor3(color),
								},
							},
						},
					},
				],})

			index++
		}

	}

	// MARK: SampleColorWheel
	private SampleColorWheel(
		wheelEntity: Entity,
		callback: (color: Color3) => void
	) {


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
				const worldRotation = utils.getWorldRotation(wheelEntity)

				// Convert hit point into the wheel's local space so rotated wheels work
				const rotationInverse = Quaternion.create(
					-worldRotation.x,
					-worldRotation.y,
					-worldRotation.z,
					worldRotation.w
				)
				const local = Vector3.rotate(Vector3.subtract(result.position, worldPosition), rotationInverse)
				
				// XZ plane
				const x = local.x
				const y = local.y
				
				const angle = Math.atan2(-x, y)
				
				let hue = angle / (2 * Math.PI)
				if (hue < 0) hue += 1
				
				// Radius = brightness
				const wheelRadius = 0.75 // check the model collider in blender, radius = dimensions/2
				const hitRadius = Math.min(Math.sqrt(x * x + y * y), wheelRadius)
				
				// Value is based on distance from center of the wheel

				const value = Math.min(hitRadius / wheelRadius, 1)
				
				// Final color is based on hue, saturation, and value
				const color = hsvToColor3(hue, 1, value)
				console.log("ColorPicker: SampleColorWheel(): hitRadius: ", hitRadius, " value: ", value, " color: ", Color3.toHexString(color))



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

				// Callback:
				if (callback) {
					callback(color)
				}
				//_OutfitManager.SetHairColor(color)
			}
		})
	}
}

export const _ColorPickers = new ColorPickers()