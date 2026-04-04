import { getWorldPosition, timers } from '@dcl-sdk/utils'
import { engine, Entity, MainCamera, Transform, VirtualCamera } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'

import { GameStatus } from 'src/shared/enums'
import { ClientState, NotifyStatePayload } from 'src/shared/types'
import { eventBus } from 'src/shared/utils/eventBus'

import { ClientEvents } from 'src/client/clientEvents'

export namespace CameraController {
	const transitionDuration: number             = 0.5                        // Time the camera takes to switch from main to virtual cameras

	var cameraActive        : boolean            = false
	var cameraEntities      : Entity[]           = []
	var currentCamera       : Entity | undefined = undefined
	var currentTarget       : Entity | undefined = undefined

	var maxCameraDistanceSq : number             = 0                          // gets worked out during init so don't worry about it
	const cameraOffset      : Vector3            = Vector3.create(0, 1.75, 0) // relative to the player's position
	const maxCameraDistance : number             = 6


	
	// Stop the music when the game ends
	eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
		if (data.serverStatus == GameStatus.LOBBY) {
			ResetCamera()
		}
	})


	export function init() {
		console.log("CameraController: init()")
		engine.addSystem(System_CameraPositionUpdate)

		maxCameraDistanceSq = maxCameraDistance * maxCameraDistance
	}
	
	const System_CameraPositionUpdate = (dt: number) => {
		if (!cameraActive || !currentCamera || !currentTarget) return

		// Ensure all components are present
		const camera = Transform.getMutableOrNull(currentCamera)
		const player = Transform.getOrNull(engine.PlayerEntity)
		const target = Transform.has(currentTarget)

		if (!camera || !player || !target) return

		// If the target is parented, use its world position by adding the parent's position.
		let targetWorldPosition = getWorldPosition(currentTarget)
	
		// Compute the vector from player to target in world space
		const direction = Vector3.subtract(targetWorldPosition, player.position)
		const distanceSq = Vector3.lengthSquared(direction)
	
		if (distanceSq > maxCameraDistanceSq) {
			// Move the camera on a line from player toward the target, to ensure camera is never more than max distance from target
			const distance       = Math.sqrt(distanceSq)
			const excessDistance = distance - maxCameraDistance
			const worldDirection = Vector3.normalize(direction)
			const worldPosition  = Vector3.add(player.position, Vector3.scale(worldDirection, excessDistance))

			camera.position = Vector3.add(cameraOffset, worldPosition)
		} else {
			// Default offset
			camera.position = Vector3.add(player.position, cameraOffset)
		}
	}

	export function TrackEntity(entity: Entity) {
		console.log("CameraController: TrackEntity(): ", entity.toString())

		// Virtual Camera entity
		const camera = engine.addEntity()
		cameraEntities.push(camera)
		currentCamera = camera
		currentTarget = entity
		cameraActive = true

		// Virtual camera component
		VirtualCamera.create(camera, {
			lookAtEntity     : entity,
			defaultTransition: {
				transitionMode: VirtualCamera.Transition.Time(transitionDuration),
			}
		})

		// Position the camera directly above the player
		const playerTransform = Transform.getOrNull(engine.PlayerEntity)
		if (!playerTransform) {
			console.error("CameraController TrackEntity: target entitiy Transform not found")
			return
		}
		
		Transform.create(camera, {
			position: Vector3.add(playerTransform.position, cameraOffset),
		})

		// Enable the virtual camera
		const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
		if (!mainCamera) {
			console.error("CameraController TrackEntity: mainCamera not found")
			return
		}
		mainCamera.virtualCameraEntity = camera
	}

	export function ResetCamera() {
		console.log("CameraController: ResetCamera()")
		cameraActive = false

		// Stop using virtual camera
		const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
		if (!mainCamera) {
			console.error("CameraController ResetCamera: mainCamera not found")
			return
		}
		mainCamera.virtualCameraEntity = undefined

		
		// Cleanup old cameras, after a delay
		timers.setTimeout(() => {
			cameraEntities.forEach((camera) => {
				engine.removeEntity(camera)
			})
			cameraEntities = []
			currentCamera = undefined
			currentTarget = undefined
		}, transitionDuration * 1000 + 100)
	}
}
