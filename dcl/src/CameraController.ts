import { engine, Entity, MainCamera, Transform, VirtualCamera } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"

class CameraController {
	transitionDuration: number = 0.5

	cameraEntities: Entity[] = []

	constructor() {
		console.log("CameraController constructor")
	}

	init() {
		console.log("CameraController init")
	}

	TrackEntity(
		entity: Entity
	) {
		// Virtual Camera entity
		const camera = engine.addEntity()
		this.cameraEntities.push(camera)

		// Virtual camera component
		VirtualCamera.create(camera, {
			lookAtEntity     : entity,
			defaultTransition: {
				transitionMode: VirtualCamera.Transition.Time(this.transitionDuration),
			}
		})

		// Position the camera directly above the player
		//const playerPos = Transform.get(engine.PlayerEntity).position
		Transform.create(camera, {
			position: Vector3.create(0, 1.75, 0),
			parent: engine.PlayerEntity,
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
	}
}

export const _CameraController = new CameraController()