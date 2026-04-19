import { AvatarShape, engine, Entity, InputModifier, MainCamera, Transform, Tween, VirtualCamera } from "@dcl/sdk/ecs"
import { getWorldPosition, getWorldRotation, TimerId, timers } from '@dcl-sdk/utils'
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { HideTutorial as HideTutorialUI, ShowTutorial as ShowTutorialUI, SetTutorialInfo, ShowArrow, HideArrow, HideTutorialBtn } from "./ui/ui.tutorial"
import { SoundManager } from "src/client/soundManager"
import { sfx } from "src/client/data/sfx"
import { eventBus } from "src/shared/utils/eventBus"
import { ClientEvents } from "src/client/clientEvents"
import { ClientMessaging } from "src/client/clientMessaging"
import { ShowStatus } from "src/client/ui/ui.game.gameStatus"

export namespace Tutorial {

	var showTutorial          : boolean = true
	var tutorialTriggered     : boolean = false
	var camera                : Entity | undefined = undefined
	var cameraTarget          : Entity | undefined = undefined
	var npcMannequin          : Entity | undefined = undefined
	var npcRoot               : Entity | undefined = undefined

	var positionViewButtons   : Vector3 = Vector3.Zero()
	var positionViewMannequin : Vector3 = Vector3.Zero()

	var targetViewButtons     : Vector3 = Vector3.Zero()
	var targetViewMannequin   : Vector3 = Vector3.Zero()

	var positionViewShopsStart: Vector3 = Vector3.create(20, 3, 20)
	var targetViewShopsStart  : Vector3 = Vector3.create(25.91, 2, 25.87)

	var positionViewShopsEnd  : Vector3 = Vector3.create(20, 3, 12)
	var targetViewShopsEnd    : Vector3 = Vector3.create(25.91, 2, 6.13)

	var positionViewSalon     : Vector3 = Vector3.create(9.79, 3, 9.87)
	var targetViewSalonStart  : Vector3 = Vector3.create(8.79, 2, 6.13)
	var targetViewSalonEnd    : Vector3 = Vector3.create(1.62, 2, 8.87)

	var targetViewButtonReset : Vector3 = Vector3.Zero()
	var targetViewButtonCopy  : Vector3 = Vector3.Zero()
	var targetViewButtonSwap  : Vector3 = Vector3.Zero()

	var interval: TimerId | undefined = undefined
	var tutorialTimeouts: TimerId[] = []

	function AddTimeout(callback: () => void, delay: number) {
		tutorialTimeouts.push(timers.setTimeout(callback, delay))
	}
	function ClearTimeouts() {
		tutorialTimeouts.forEach((timeout) => {
			timers.clearTimeout(timeout)
		})
		tutorialTimeouts = []
	}

	export function TriggerTutorial(force: boolean = false) {
		if (tutorialTriggered && !force) return
		tutorialTriggered = true
		showTutorial = true

		ShowTutorial()
		eventBus.emit(ClientEvents.TUTORIAL_STARTED, undefined)
	}

	// MARK: Event Listeners
	eventBus.on(ClientEvents.TUTORIAL_ABORT, () => ClientMessaging.NotifyTutorialAborted())
	eventBus.on(ClientEvents.TUTORIAL_COMPLETED, () => ClientMessaging.NotifyTutorialCompleted())


	// MARK: Show Tutorial
	function ShowTutorial() {
		if (!showTutorial) return
		console.log("Tutorial: ShowTutorial")

		GetEntities()
		if (!npcRoot) { console.log("Tutorial: npcRoot not found"); return }
		if (!npcMannequin) { console.log("Tutorial: npcMannequin not found"); return }

		GetCameraPositions()
		CreateCameraAndTarget()
		if (!camera || !cameraTarget) { console.error("Tutorial: camera or cameraTarget not found"); return }

		console.log("Tutorial: camera starts at", getWorldPosition(camera!).toString())
		console.log("Tutorial: camera target starts at", getWorldPosition(cameraTarget!).toString())

		// Start runniong our camera checks
		interval = timers.setInterval(EnsureCameraIsSet, 100)
		
		// Freeze the Player input
	/* 	InputModifier.createOrReplace(engine.PlayerEntity, {
			mode: InputModifier.Mode.Standard({
				disableAll: true,
			}),
		}) */

		// Set the camera as the active camera
		const mainCamera = MainCamera.getMutable(engine.CameraEntity)
		mainCamera.virtualCameraEntity = camera

		// Turn the mannequin to face the camera
		const mannequinTransform = Transform.getMutableOrNull(npcMannequin!)
		if (!mannequinTransform) { console.error("Tutorial: mannequinTransform not found"); return }
		mannequinTransform.rotation = Quaternion.fromEulerDegrees(0, 180, 0)
		//Tween.setRotate(npcMannequin, Quaternion.Zero(), Quaternion.fromEulerDegrees(0, 180, 0), 300)


		// Wave to the camera
		// Look at mannequin
		AddTimeout(() => {
			if (!showTutorial) return
			SetTutorialInfo("thisIsYourMannequin")
			ShowTutorialUI()
			SoundManager.PlaySound(sfx.greeting)
		}, 500)
		
		AddTimeout(() => {
			if (!showTutorial) return
			Wave()
		}, 1200)
		
		// Look at stores
		AddTimeout(() => {
			if (!showTutorial) return
			Tween.setMove(camera!, getWorldPosition(camera!), positionViewShopsStart, 1500)
			Tween.setMove(cameraTarget!, getWorldPosition(cameraTarget!), targetViewShopsStart, 1000)
			SetTutorialInfo("equipClothes")
			
			SoundManager.PlaySound(sfx.cameraMove)
		}, 5000)

		// Pan across at stores
		AddTimeout(() => {
			if (!showTutorial) return
			Tween.setMove(camera!, getWorldPosition(camera!), positionViewShopsEnd, 3500)
			Tween.setMove(cameraTarget!, getWorldPosition(cameraTarget!), targetViewShopsEnd, 2000)
		}, 6500)


		// Look at salon
		AddTimeout(() => {
			if (!showTutorial) return
			Tween.setMove(camera!, getWorldPosition(camera!), positionViewSalon, 1000)
			Tween.setMove(cameraTarget!, getWorldPosition(cameraTarget!), targetViewSalonStart, 1000)
			SetTutorialInfo("changeColor")
			SoundManager.PlaySound(sfx.cameraMove)
		}, 10000)

		// Pan across at salon
		AddTimeout(() => {
			if (!showTutorial) return
			Tween.setMove(cameraTarget!, getWorldPosition(cameraTarget!), targetViewSalonEnd, 3000)
		}, 11000)


		// Now back to the mannequin and its buttons
		AddTimeout(() => {
			if (!showTutorial) return
			Tween.setMove(camera!, getWorldPosition(camera!), positionViewMannequin, 1000)
			Tween.setMove(cameraTarget!, getWorldPosition(cameraTarget!), targetViewMannequin, 600)
			HideTutorialUI()
			SoundManager.PlaySound(sfx.cameraMove)
		}, 14000)

		// Btn: Reset
		AddTimeout(() => {
			if (!showTutorial) return
			Tween.setMove(camera!, getWorldPosition(camera!), positionViewButtons, 600)
			Tween.setMove(cameraTarget!, getWorldPosition(cameraTarget!), targetViewButtonReset, 300)
			SetTutorialInfo("btnReset")
			ShowTutorialUI()
			SoundManager.PlaySound(sfx.colorPicker)
		}, 15000)

		// Btn: Swap
		AddTimeout(() => {
			if (!showTutorial) return
			Tween.setMove(cameraTarget!, getWorldPosition(cameraTarget!), targetViewButtonSwap, 300)
			SetTutorialInfo("btnSwap")
			SoundManager.PlaySound(sfx.colorPicker)
		}, 17000)

		// Btn: Copy
		AddTimeout(() => {
			if (!showTutorial) return
			Tween.setMove(cameraTarget!, getWorldPosition(cameraTarget!), targetViewButtonCopy, 300)
			SetTutorialInfo("btnCopy")
			SoundManager.PlaySound(sfx.colorPicker)
		}, 19000)

		// Back out to view the mannequin as a whoile while we show the final info
		AddTimeout(() => {
			if (!showTutorial) return
			Tween.setMove(camera!, getWorldPosition(camera!), positionViewMannequin, 600)
			Tween.setMove(cameraTarget!, getWorldPosition(cameraTarget!), targetViewMannequin, 300)
			SoundManager.PlaySound(sfx.cameraMove)
			ShowStatus()
			SetTutorialInfo("startGame")
			ShowArrow()
		}, 21000)


		AddTimeout(() => {
			if (!showTutorial) return
			eventBus.emit(ClientEvents.SHOW_DRESS_ME_HINT, undefined)
			eventBus.emit(ClientEvents.TUTORIAL_COMPLETED, undefined)
			EndTutorial()
		}, 26000)

	}

	// MARK: Wave
	function Wave() {
		console.log("Tutorial: wave")

		const avatarShape = AvatarShape.getMutableOrNull(npcMannequin!)
		if (!avatarShape) {
			console.log("Tutorial: avatarShape not found")
			return
		}

		avatarShape.expressionTriggerId = "urn:decentraland:off-chain:base-emotes:wave"
		avatarShape.expressionTriggerTimestamp = (avatarShape.expressionTriggerTimestamp ?? 0) + 1
	}


	// MARK: Get Entities
	function GetEntities() {
		const npcMannequinEntity = [...engine.getEntitiesByTag("npcMannequin")][0]
		if (!npcMannequinEntity) {
			console.log("Tutorial: npcMannequin not found")
			return undefined
		}
		npcMannequin = npcMannequinEntity
		
		const npcRootEntity = [...engine.getEntitiesByTag("npcRoot")][0]
		if (!npcRootEntity) {
			console.log("Tutorial: npcRoot not found")
			return undefined
		}
		npcRoot = npcRootEntity

	}

	// MARK: Camera Positions
	function GetCameraPositions() {
		const npcPodium = [...engine.getEntitiesByTag("npcPodium")][0]
		if (!npcPodium) {
			console.log("Tutorial: npcPodiums not found")
			return
		}

		// Get the podium position and directionw
		const podiumRotation = getWorldRotation(npcPodium)
		const podiumPosition = getWorldPosition(npcPodium)
		const forward = Vector3.rotate(Vector3.Backward(), podiumRotation)

		// View mannequin position
		positionViewMannequin = Vector3.add(
			podiumPosition,
			Vector3.create(forward.x * 3.5, 2, forward.z * 3.5)
		)
		targetViewMannequin = Vector3.add(
			podiumPosition, 
			Vector3.create(0, 1.2, 0)
		)

		// View buttons position
		positionViewButtons = Vector3.add(
			podiumPosition,
			Vector3.create(forward.x * 1.5, 0.75, forward.z * 1.5)
		)
		targetViewButtons = Vector3.add(
			podiumPosition, 
			Vector3.create(forward.x * 0.5, 0.1, forward.z * 0.5)
		)

		const btnResetPosition = Vector3.rotate(Vector3.create(-0.42, 0.15, -0.61), podiumRotation)
		const btnSwapPosition  = Vector3.rotate(Vector3.create(0,     0.15, -0.61), podiumRotation)
		const btnCopyPosition  = Vector3.rotate(Vector3.create(0.42,  0.15, -0.61), podiumRotation)

		targetViewButtonReset = Vector3.add(podiumPosition, btnResetPosition)
		targetViewButtonSwap = Vector3.add(podiumPosition, btnSwapPosition)
		targetViewButtonCopy = Vector3.add(podiumPosition, btnCopyPosition)
		
	}


	// MARK: Camera
	function CreateCameraAndTarget() {
		cameraTarget = engine.addEntity()
		Transform.create(cameraTarget, {
			position: targetViewMannequin,
		})

		camera = engine.addEntity()
		Transform.create(camera, {
			position: positionViewMannequin,
		})
		VirtualCamera.create(camera, {
			lookAtEntity: cameraTarget,
			defaultTransition: {
				transitionMode: VirtualCamera.Transition.Time(1),
			}
		})
	}

	function RemoveCamera() {
		if (camera) {
			const mainCamera = MainCamera.getMutable(engine.CameraEntity)
			mainCamera.virtualCameraEntity = undefined

			timers.setTimeout(() => {
				engine.removeEntity(camera!)
				camera = undefined
			}, 1000)
		}
	}

	function EnsureCameraIsSet() {
		if (!showTutorial) {
			if (interval) timers.clearInterval(interval)
			return
		}

		const mainCamera = MainCamera.getMutable(engine.CameraEntity)
		if (mainCamera.virtualCameraEntity !== camera) {
			console.log("Tutorial: ERROR! Virtual camera was not being used. Fixing it...")
			mainCamera.virtualCameraEntity = camera
		}
	}
	

	// MARK: Abort Tutorial
	export function AbortTutorial() {
		console.log("Tutorial: AbortTutorial")
		eventBus.emit(ClientEvents.TUTORIAL_ABORT, undefined)
		EndTutorial()
	}

	// MARK: Quit Tutorial
	export function EndTutorial() {
		console.log("Tutorial: EndTutorial")
		showTutorial = false
		ClearTimeouts()

		// Unfreeze the Player input
		InputModifier.createOrReplace(engine.PlayerEntity, {
			mode: InputModifier.Mode.Standard({
				disableAll: false,
			}),
		})

		// Remove the camera
		RemoveCamera()

		// Hide the tutorial
		HideTutorialUI()
		HideTutorialBtn()

		HideArrow()

		if (npcMannequin) {
			const t = Transform.getMutableOrNull(npcMannequin)
			if (t) t.rotation = Quaternion.fromEulerDegrees(0, 0, 0)
		}
	}

}
