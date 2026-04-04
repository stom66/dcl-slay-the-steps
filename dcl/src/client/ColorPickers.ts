import { EasingFunction, engine, Entity, GltfContainer, GltfNodeModifiers, InputAction, Material, MaterialTransparencyMode, MeshRenderer, PBMaterial_PbrMaterial, pointerEventsSystem, PrimaryPointerInfo, RaycastQueryType, raycastSystem, Transform, Tween } from '@dcl/sdk/ecs'
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math'

import * as utils from '@dcl-sdk/utils'
import { hsvToColor3 } from 'src/client/utils'

import { OutfitManager } from 'src/client/outfitManager'
import { SoundManager } from './soundManager'
import { sfx } from './data/sfx'

type ColorPickerConfig = {
	callback       : (color:  Color3) => void,
	position       : Vector3,
	rotation       : Vector3,
	presetHexCodes?: string[],
	title          : string,
}


class ColorPicker {

	// Constructor properties
	private callback         : (color: Color3) => void
	private position         : Vector3
	private rotation         : Quaternion
	private presetHexCodes   : string[]
	private title            : string

	// Entity references
	private entityColorWheel : Entity
	private entityValueSlider: Entity
	private entityValueHandle: Entity

	// Color properties
	private currentColor     : Color3 = Color3.create(0, 0, 0)
	private currentHue       : number = 0
	private currentSaturation: number = 0
	private currentValue     : number = 0

	// Model related config stuff
	private interactionDistance = 8    // 
	private sliderRange         = 1.56 // Taken from the blender model, distance from maxLeft to maxRight
	private wheelRadius         = 0.75 // Taken from the blender model, how far radius = dimensions/2


	constructor(config: ColorPickerConfig) {
		this.title             = config.title
		this.position          = config.position
		this.rotation          = Quaternion.fromEulerDegrees(config.rotation.x, config.rotation.y, config.rotation.z)
		this.presetHexCodes    = config.presetHexCodes ?? []
		this.callback          = config.callback

		this.entityColorWheel = this.CreateColorWheel()
		const { sliderEntity, handleEntity } = this.CreateValueSlider()
		this.entityValueSlider = sliderEntity
		this.entityValueHandle = handleEntity

		if (this.presetHexCodes.length > 0) {
			this.CreatePresetButtons()
		}

		this.SetValueSlider(1, true)
	}

	// MARK: Create Color Wheel
	private CreateColorWheel() {

		const wheelEntity = engine.addEntity()
		Transform.create(wheelEntity, {
			position: this.position,
			rotation: this.rotation
		})
		GltfContainer.create(wheelEntity, {
			src: 'assets/models/shopZoneColorPicker.gltf'
		})
		
		pointerEventsSystem.onPointerDown(
			{ 
				entity: wheelEntity, 
				opts: {
					button     : InputAction.IA_POINTER,
					hoverText  : "Choose " + this.title + " Color",
					maxDistance: this.interactionDistance
				} 
			},
			() => { this.SampleColorWheel() }
		)

		// Also add the title gltf
		const titleEntity = engine.addEntity()
		Transform.create(titleEntity, {
			parent: wheelEntity
		})
		GltfContainer.create(titleEntity, {
			src: `assets/models/shopZoneColorPicker.Text${this.title}.gltf`
		})

		return wheelEntity
	}

	// MARK: CreateValueSlider
	private CreateValueSlider() {

		// The slider
		const sliderEntity = engine.addEntity()
		Transform.create(sliderEntity, {
			position: Vector3.add(this.position, Vector3.create(0, -1.25, 0)),
			rotation: this.rotation
		})
		GltfContainer.create(sliderEntity, {
			src: `assets/models/shopZoneColorPicker.Value.gltf`
		})

		// The handle
		const handleEntity = engine.addEntity()
		Transform.create(handleEntity, {
			parent: sliderEntity
		})
		GltfContainer.create(handleEntity, {
			src: `assets/models/shopZoneColorPicker.ValueHandle.gltf`
		})
		
		pointerEventsSystem.onPointerDown(
			{ 
				entity: sliderEntity, 
				opts: {
					button     : InputAction.IA_POINTER,
					//hoverText  : "Choose Value",
					maxDistance: this.interactionDistance
				} 
			},
			() => {
				this.SampleValueSlider()
			}
		)

		return { sliderEntity, handleEntity }
	}


	// MARK: Create Color presets
	private CreatePresetButtons() {

		const startZRot = 0
		const rotStep   = -20
		var index       = 0

		for (const hexCode of this.presetHexCodes) {
			if (index == 5 ) index +=4 // skip over the bottom 2 slots

			const color = Color3.fromHexString(hexCode)

			const buttonEntity = engine.addEntity()

			const elementQRot  = Quaternion.fromEulerDegrees(0, 0, rotStep * index)
			const combinedQRot = Quaternion.multiply(this.rotation, elementQRot)
			Transform.create(buttonEntity, {
				position: this.position,
				rotation: combinedQRot
			})
			GltfContainer.create(buttonEntity, {
				src: `assets/models/shopZoneColorPickerBtn.gltf`
			})

			pointerEventsSystem.onPointerDown(
				{ 
					entity: buttonEntity, 
					opts: { 
						button     : InputAction.IA_POINTER,
						hoverText  : "Choose Color",
						maxDistance: this.interactionDistance
					} 
				},
				() => {
					OutfitManager.SetSkinColor(color)
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
				]
			})

			index++
		}

	}


	// MARK: SampleColorWheel
	private async SampleColorWheel() {
		// Get the local mouse position on the wheel
		const local = await this.GetLocalMousePosition(this.entityColorWheel)
		console.log("ColorPicker: SampleColorWheel(): local: ", local.toString())		
		
		// Hue is based on the angle of the mouse position
		const angle = Math.atan2(-local.x, local.y)
		this.currentHue = angle / (2 * Math.PI)
		if (this.currentHue < 0) this.currentHue += 1
		

		// Saturation is based on distance from center of the wheel
		const hitRadius = Math.min(Math.sqrt(local.x * local.x + local.y * local.y), this.wheelRadius)
		this.currentSaturation = Math.min(hitRadius / this.wheelRadius, 1)
		
		// Final color is based on currentHue, currentSaturation, and currentValue
		this.currentColor = hsvToColor3(this.currentHue, this.currentSaturation, this.currentValue)
		console.log("ColorPicker: SampleColorWheel(): hitRadius: ", hitRadius, " value: ", this.currentValue, " color: ", Color3.toHexString(this.currentColor))

		// Callback:
		if (this.callback) {
			this.callback(this.currentColor)
		}

		// Tint the value slider
		const color = Color4.fromColor3(hsvToColor3(this.currentHue, 1, 1))
		const pbr: PBMaterial_PbrMaterial = {
			albedoColor      : color,
			emissiveColor    : color,
			emissiveIntensity: 0.6
		}
		this.TintMesh(this.entityValueSlider, 'valueSlider.tint', pbr)


		// Make a temporary marker entity to show where the cast hit
		const markerEntity = engine.addEntity()
		Transform.create(markerEntity, {
			position: local,
			scale   : Vector3.Zero(),
			parent  : this.entityColorWheel
		})
		MeshRenderer.setSphere(markerEntity)
		Material.setPbrMaterial(markerEntity, {
			albedoColor: Color4.fromColor3(this.currentColor)
		})

		// Trigger a soundeffect
		SoundManager.PlaySound(sfx.colorPicker)

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


	// MARK: SampleValueSlider
	private async SampleValueSlider() {

		// Get the local mouse position on the slider
		const local = await this.GetLocalMousePosition(this.entityValueSlider)
				
		// Convert that local position to a value between 0 and 1, from left to right on the slider
		var value = -local.x + this.sliderRange / 2
		value     = Math.min(Math.max(value, 0), this.sliderRange) / this.sliderRange
		console.log("ColorPicker: SampleValueSlider(): value: ", value, local.x)

		this.SetValueSlider(value)
	}


	private SetValueSlider(value: number, skipCallback: boolean = false) {		
		// Store the new value, and the new color
		this.currentValue = value
		this.currentColor = hsvToColor3(this.currentHue, this.currentSaturation, this.currentValue)

		// Tint the color wheel overlay
		const pbr: PBMaterial_PbrMaterial = {
			albedoColor     : Color4.fromColor3(Color3.Black(), 1-this.currentValue),
			transparencyMode: MaterialTransparencyMode.MTM_ALPHA_BLEND
		}
		this.TintMesh(this.entityColorWheel, 'colorWheel.blackOverlay', pbr)

		// Tween the handle to the position
		Tween.setMove(this.entityValueHandle, Transform.get(this.entityValueHandle).position, Vector3.create(-value * this.sliderRange, 0, 0), 100, EasingFunction.EF_EASEINBOUNCE)

		// Callback:
		if (this.callback && !skipCallback) {
			this.callback(this.currentColor)
		}
	}


	// MARK: GetLocalMousePosition
	private GetLocalMousePosition(entity: Entity): Promise<Vector3> {
		return new Promise((resolve, reject) => {
			const pointerInfo = PrimaryPointerInfo.getOrCreateMutable(engine.RootEntity)
			var dir = pointerInfo.worldRayDirection

			raycastSystem.registerGlobalDirectionRaycast({
				entity: engine.CameraEntity,
				opts  : {
					queryType: RaycastQueryType.RQT_HIT_FIRST,
					direction: dir,
				},
			}, 
			(raycastResult) => {
				var result = raycastResult.hits[0]

				if (result && result.position) {
					// Work out where the cast hit the wheel
					// Convert hit point from world space into the entity's local space so rotated entities work
					const worldPosition   = utils.getWorldPosition(entity)
					const worldRotation   = utils.getWorldRotation(entity)
					const rotationInverse = Quaternion.create( -worldRotation.x, -worldRotation.y, -worldRotation.z, worldRotation.w )
					const localPosition   = Vector3.rotate(Vector3.subtract(result.position, worldPosition), rotationInverse)
					resolve(localPosition)
				} else {
					resolve(Vector3.Zero())
				}
			})
		})
	}


	/// MARK: TintMesh
	private TintMesh(
		entity: Entity, 
		path  : string,
		pbr   : PBMaterial_PbrMaterial
	) {
		GltfNodeModifiers.createOrReplace(entity, {
			modifiers: [{
				path: path,
				material: {
					material: {
						$case: 'pbr',
						pbr  : pbr,
					}
				},
			}]
		})
	}

}


// MARK: SetupColorPickers
export function SetupColorPickers() {
	const hairColorPicker = new ColorPicker({
		callback: (color: Color3) => OutfitManager.SetHairColor(color),
		title   : "Hair",
		position: Vector3.create(8, 1.92, 1.75),
		rotation: Vector3.create(0, 0, 0)
	})

	const skinColorPicker = new ColorPicker({
		callback      : (color: Color3) => OutfitManager.SetSkinColor(color),
		title         : "Skin",
		position      : Vector3.create(1.75, 1.92, 8.25),
		rotation      : Vector3.create(0, 90, 0),
		presetHexCodes: ["#FFE4C6", "#FFDDBC", "#F2C2A5", "#DDB18F", "#CC9B77", "#9A765B", "#7D5D47", "#704C38", "#522C1C", "#3C2216"]
	})
}