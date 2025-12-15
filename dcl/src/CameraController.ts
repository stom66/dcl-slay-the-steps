import { engine, Entity, MainCamera, Transform, VirtualCamera } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

class CameraController {
	transitionDuration: number = 0.5

	cameraEntities: Entity[] = []
	currentCamera: Entity | undefined = undefined
	currentTarget: Entity | undefined = undefined

	maxCameraDistance: number = 5
	cameraOffset: Vector3 = Vector3.create(0, 1.75, 0)

	constructor() {
		console.log("CameraController constructor")
	}

	init() {
		console.log("CameraController init")
		engine.addSystem(this.System_CameraPositionUpdate)
	}
	
	System_CameraPositionUpdate = (dt: number) => {
		if (!this.currentCamera || !this.currentTarget) return

		// If the transform was removed (eg. camera entity cleaned up), stop early to avoid runtime errors.
		if (!Transform.has(this.currentCamera) || !Transform.has(this.currentTarget) || !Transform.has(engine.PlayerEntity)) {
			return
		}
	
		const camera = Transform.getMutable(this.currentCamera)
		const player = Transform.get(engine.PlayerEntity)
		const target = Transform.get(this.currentTarget)

		if (!camera || !player || !target) return
	
		// Compute the vector from player to target in world space
		const toTarget = Vector3.subtract(target.position, player.position)
		const distance = Vector3.length(toTarget)
	
		if (distance > this.maxCameraDistance) {
			// Scale the vector to enforce max distance
			const excessDistance = distance - this.maxCameraDistance
			const worldDirection = Vector3.normalize(toTarget)

			const worldPosition = Vector3.add(player.position, Vector3.scale(worldDirection, excessDistance))
			camera.position = Vector3.add(this.cameraOffset, worldPosition)
		} else {
			// Default offset
			camera.position = Vector3.add(player.position, this.cameraOffset)
		}
	}

	TrackEntity(
		entity: Entity
	) {
		// Virtual Camera entity
		const camera = engine.addEntity()
		this.cameraEntities.push(camera)
		this.currentCamera = camera
		this.currentTarget = entity

		// Virtual camera component
		VirtualCamera.create(camera, {
			lookAtEntity     : entity,
			defaultTransition: {
				transitionMode: VirtualCamera.Transition.Time(this.transitionDuration),
			}
		})

		// Position the camera directly above the player
		const playerPos = Transform.get(engine.PlayerEntity).position
		Transform.create(camera, {
			position: Vector3.add(playerPos, this.cameraOffset),
		})

		// Enable the virtual camera
		const mainCamera = MainCamera.getMutable(engine.CameraEntity)
		mainCamera.virtualCameraEntity = camera
	}

	ResetCamera() {
		console.log("CameraController ResetCamera")

		// Stop using virtual camera
		const mainCamera = MainCamera.getMutable(engine.CameraEntity)
		mainCamera.virtualCameraEntity = undefined

		// Cleanup old cameras
		this.cameraEntities.forEach((camera) => {
			engine.removeEntity(camera)
		})
		this.cameraEntities = []
		this.currentCamera = undefined
		this.currentTarget = undefined
	}
}

export const _CameraController = new CameraController()