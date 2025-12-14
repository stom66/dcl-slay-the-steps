import { engine, Entity, MainCamera, VirtualCamera } from "@dcl/sdk/ecs"

class CameraController {
	transitionDuration: number = 0.5

	constructor() {
		console.log("CameraController constructor")
	}

	init() {
		console.log("CameraController init")
	}

	TrackEntity(
		entity: Entity
	) {
		const camera = engine.CameraEntity

		VirtualCamera.create(camera, {
			lookAtEntity     : entity,
			defaultTransition: {
				transitionMode: VirtualCamera.Transition.Time(this.transitionDuration),
			}
		})
		const target = entity

		const mainCamera = MainCamera.getMutable(engine.CameraEntity)
		mainCamera.virtualCameraEntity = camera
	}

	ResetCamera() {
		const mainCamera = MainCamera.getMutable(engine.CameraEntity)
		mainCamera.virtualCameraEntity = undefined
	}
}

export const _CameraController = new CameraController()