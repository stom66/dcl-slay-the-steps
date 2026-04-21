import { engine, Entity, MainCamera, Transform, VirtualCamera } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'

import { GameStatus } from 'src/shared/enums'
import { ClientState, NotifyStatePayload } from 'src/shared/types'
import { eventBus } from 'src/shared/utils/eventBus'

import { ClientEvents } from 'src/client/clientEvents'


export namespace CameraController {

	// MARK: Event Binding
	eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
		if (data.serverStatus == GameStatus.VOTING) {
			ResetCamera()
		}
	})


	// MARK: Vars
	const transitionDuration : number              = 0.5                        // Time the camera takes to switch from main to virtual cameras
	const tweenDuration      : number              = 0.5                        // seconds per tween step — lower = more responsive, higher = smoother

	var cameraActive         : boolean             = false
	var cameraEntities       : Entity[]            = []
	var currentCamera        : Entity | undefined  = undefined
	var currentTarget        : Entity | undefined  = undefined
	var cameraDesiredPosition: Vector3 | undefined = undefined

	const cameraOffset       : Vector3             = Vector3.create(0, 1.75, 0) // relative to the player's position
	const maxCameraDistance  : number              = 6
	const maxCameraDistanceSq: number              = maxCameraDistance * maxCameraDistance

	var timeSinceLastUpdate : number = 0.025


	// MARK: Init
	export function init() {
		console.log("CameraController: init()")
		engine.addSystem(System_CameraDesiredPositionUpdate)
	}


	// MARK: System - Desired Position Update
	// Computes the ideal camera position each frame and stores it, without directly modifying the camera Transform
	const System_CameraDesiredPositionUpdate = (dt: number) => {
		timeSinceLastUpdate += dt
		if (timeSinceLastUpdate < tweenDuration) return
		timeSinceLastUpdate = 0

		if (!cameraActive || !currentCamera || !currentTarget) return

		const player = Transform.getOrNull(engine.PlayerEntity)
		const target = Transform.has(currentTarget)

		if (!player || !target) return

		let targetWorldPosition = utils.getWorldPosition(currentTarget)

		const direction = Vector3.subtract(targetWorldPosition, player.position)
		const distanceSq = Vector3.lengthSquared(direction)

		// Move the camera on a line from player toward the target, to ensure camera is never more than max distance from target
		if (distanceSq > maxCameraDistanceSq) {
			const distance       = Math.sqrt(distanceSq)
			const excessDistance = distance - maxCameraDistance
			const worldDirection = Vector3.normalize(direction)
			const worldPosition  = Vector3.add(player.position, Vector3.scale(worldDirection, excessDistance))

			cameraDesiredPosition = Vector3.add(cameraOffset, worldPosition)
		} else {
			cameraDesiredPosition = Vector3.add(player.position, cameraOffset)
		}
	}


	// MARK: Tween Chain
	// Each tween moves the camera from its current position to the latest desired position,
	// then the onFinish callback kicks off the next tween in the chain.
	function startNextCameraTween() {
		if (!cameraActive || !currentCamera || !cameraDesiredPosition) return

		const camera = Transform.getOrNull(currentCamera)
		if (!camera) return

		utils.tweens.startTranslation(
			currentCamera,
			camera.position,
			cameraDesiredPosition,
			tweenDuration,
			utils.InterpolationType.LINEAR,
			() => startNextCameraTween()
		)
	}


	// MARK: TrackEntity
	// Note this needs to be timeframe independent, so that a late-joining spectator gets the same view as the other players
	export function TrackEntity(entity: Entity) {
		console.log("CameraController: TrackEntity(): ", entity.toString())

		const camera = engine.addEntity()
		cameraEntities.push(camera)
		currentCamera = camera
		currentTarget = entity
		cameraActive = true

		VirtualCamera.create(camera, {
			lookAtEntity     : entity,
			defaultTransition: {
				transitionMode: VirtualCamera.Transition.Time(transitionDuration),
			}
		})

		const playerTransform = Transform.getOrNull(engine.PlayerEntity)
		if (!playerTransform) {
			console.error("CameraController TrackEntity: target entity Transform not found")
			return
		}

		cameraDesiredPosition = Vector3.add(playerTransform.position, cameraOffset)

		Transform.create(camera, {
			position: Vector3.add(playerTransform.position, cameraOffset),
		})

		const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
		if (!mainCamera) {
			console.error("CameraController TrackEntity: mainCamera not found")
			return
		}
		mainCamera.virtualCameraEntity = camera

		startNextCameraTween()
	}


	// MARK: ResetCamera
	export function ResetCamera() {
		console.log("CameraController: ResetCamera()")
		cameraActive = false
		cameraDesiredPosition = undefined

		if (currentCamera) {
			utils.tweens.stopTranslation(currentCamera)
		}

		const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
		if (!mainCamera) {
			console.error("CameraController ResetCamera: mainCamera not found")
			return
		}
		mainCamera.virtualCameraEntity = undefined

		utils.timers.setTimeout(() => {
			cameraEntities.forEach((camera) => {
				engine.removeEntity(camera)
			})
			cameraEntities = []
			currentCamera = undefined
			currentTarget = undefined
		}, transitionDuration * 1000 + 100)
	}
}
