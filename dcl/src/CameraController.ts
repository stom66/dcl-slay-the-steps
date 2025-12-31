import { getWorldPosition, timers } from "@dcl-sdk/utils"
import { engine, Entity, MainCamera, Transform, VirtualCamera } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"

class CameraController {
	transitionDuration: number = 0.5 // Time the camera takes to switch from main to virtual cameras

	cameraEntities: Entity[] = []
	cameraActive: boolean = false
	currentCamera: Entity | undefined = undefined
	currentTarget: Entity | undefined = undefined

	maxCameraDistance: number = 6
	maxCameraDistanceSquared: number = 0 // gets worked out during init so don't worry about it
	cameraOffset: Vector3 = Vector3.create(0, 1.75, 0) // relative to the player's position

	constructor() {
		console.log("CameraController constructor")
	}

	init() {
		console.log("CameraController: init()")
		engine.addSystem(this.System_CameraPositionUpdate)

		this.maxCameraDistanceSquared = this.maxCameraDistance * this.maxCameraDistance
	}
	
	System_CameraPositionUpdate = (dt: number) => {
		if (!this.cameraActive || !this.currentCamera || !this.currentTarget) return

		// Ensure all components are present
		const camera = Transform.getMutableOrNull(this.currentCamera)
		const player = Transform.getOrNull(engine.PlayerEntity)
		const target = Transform.has(this.currentTarget)

		if (!camera || !player || !target) return

		// If the target is parented, use its world position by adding the parent's position.
		let targetWorldPosition = getWorldPosition(this.currentTarget)
	
		// Compute the vector from player to target in world space
		const direction = Vector3.subtract(targetWorldPosition, player.position)
		const distanceSq = Vector3.lengthSquared(direction)
	
		if (distanceSq > this.maxCameraDistanceSquared) {
			// Move the camera on a line from player toward the target, to ensure camera is never more than max distance from target
			const distance       = Math.sqrt(distanceSq)
			const excessDistance = distance - this.maxCameraDistance
			const worldDirection = Vector3.normalize(direction)
			const worldPosition  = Vector3.add(player.position, Vector3.scale(worldDirection, excessDistance))

			camera.position = Vector3.add(this.cameraOffset, worldPosition)
		} else {
			// Default offset
			camera.position = Vector3.add(player.position, this.cameraOffset)
		}
	}

	TrackEntity(
		entity: Entity
	) {
		console.log("CameraController: TrackEntity(): ", entity.toString())

		// Virtual Camera entity
		const camera = engine.addEntity()
		this.cameraEntities.push(camera)
		this.currentCamera = camera
		this.currentTarget = entity
		this.cameraActive = true

		// Virtual camera component
		VirtualCamera.create(camera, {
			lookAtEntity     : entity,
			defaultTransition: {
				transitionMode: VirtualCamera.Transition.Time(this.transitionDuration),
			}
		})

		// Position the camera directly above the player
		const playerTransform = Transform.getOrNull(engine.PlayerEntity)
		if (!playerTransform) {
			console.error("CameraController TrackEntity: target entitiy Transform not found")
			return
		}
		
		Transform.create(camera, {
			position: Vector3.add(playerTransform.position, this.cameraOffset),
		})

		// Enable the virtual camera
		const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
		if (!mainCamera) {
			console.error("CameraController TrackEntity: mainCamera not found")
			return
		}
		mainCamera.virtualCameraEntity = camera
	}

	ResetCamera() {
		console.log("CameraController: ResetCamera()")
		this.cameraActive = false

		// Stop using virtual camera
		const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
		if (!mainCamera) {
			console.error("CameraController ResetCamera: mainCamera not found")
			return
		}
		mainCamera.virtualCameraEntity = undefined

		
		// Cleanup old cameras, after a delay
		timers.setTimeout(() => {
			this.cameraEntities.forEach((camera) => {
				engine.removeEntity(camera)
			})
			this.cameraEntities = []
			this.currentCamera = undefined
			this.currentTarget = undefined
		}, this.transitionDuration * 1000)
	}
}

export const _CameraController = new CameraController()