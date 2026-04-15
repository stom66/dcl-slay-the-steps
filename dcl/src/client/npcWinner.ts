import { AvatarShape, Billboard, BillboardMode, engine, Entity, GltfContainer, InputAction, pointerEventsSystem, PointerEvents, Transform, Tween, EasingFunction } from "@dcl/sdk/ecs"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"
import  * as utils from "@dcl-sdk/utils"

import { GameStatus } from "src/shared/enums"
import { ClientState } from "src/shared/types"
import { eventBus } from "src/shared/utils/eventBus"

import { sfx } from "src/client/data/sfx"
import { ClientEvents } from "src/client/clientEvents"
import { ClientMessaging } from "src/client/clientMessaging"
import { SoundManager } from "src/client/soundManager"
import { avatarManager } from "./avatarManager"
import { ClientStore } from "./clientStore"


// MARK: Event Bindings


export namespace NPCWinner {
		
	// MARK: Variables
	const clientStore: ClientStore = ClientStore.getInstance()

	var podium   : Entity | undefined = undefined
	var npcEntity: Entity | undefined = undefined

	const position = Vector3.create(16, 0.4, 16)
	const scale = Vector3.create(1.2, 1.2, 1.2)

	export function Init() {
		eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
			if (data.serverStatus === GameStatus.GAME_ENDED) {
				SpawnNPCWinner()
			}
		})
	}


	// MARK: SpawnNPCWinner
	export function SpawnNPCWinner() {
		console.log("npcWinner: SpawnNPCWinner")

		// Delete the existing NPC if it exists
		if (npcEntity && Transform.getOrNull(npcEntity)) {
			const oldNpcEntity = npcEntity
			// Tween scale out the existing winner
			Tween.setScale(oldNpcEntity, scale, Vector3.Zero(), 300, EasingFunction.EF_EASEINQUAD)

			utils.timers.setTimeout(() => {
				AvatarShape.deleteFrom(oldNpcEntity)
				engine.removeEntity(oldNpcEntity)
			}, 350)
		}

		// Exit if no winner
		const lastWinner = clientStore.getLastWinner()
		if (!lastWinner) {
			console.log("npcWinner: updateNPCWinner: lastWinner not found")
			
			if (podium) {
				Tween.setScale(podium, scale, Vector3.Zero(), 300, EasingFunction.EF_EASEINQUAD)
			}
			utils.timers.setTimeout(() => {
				AvatarShape.deleteFrom(podium!)
				engine.removeEntity(podium!)
			}, 350)
			return
		}

		// Ensure the podium exists
		if (!podium || !Transform.getOrNull(podium)) {
			// Create the podium
			podium = engine.addEntity()
			Transform.create(podium, {
				position: position,
				rotation: Quaternion.fromEulerDegrees(0, 0, 0),
				scale: Vector3.Zero()
			})
			Tween.setScale(podium, Vector3.Zero(), Vector3.create(1, 1, 1), 400, EasingFunction.EF_EASEINQUAD)

			Billboard.create(podium, {
				billboardMode: BillboardMode.BM_Y
			})
			GltfContainer.create(podium, {
				src: "assets/models/podium.gltf",
			})
		}

		// Create the NPC, parented to the podium
		npcEntity = engine.addEntity()
		Transform.create(npcEntity, {
			parent: podium,
			position: Vector3.create(0, 0, 0),
			rotation: Quaternion.fromEulerDegrees(0, 180, 0),
			scale: Vector3.Zero()
			//scale: scale
		})

		utils.timers.setTimeout(() => {
			avatarManager.SpawnAvatar(npcEntity!, {
				id       : lastWinner.userId + "NPC    ",
				name     : lastWinner.displayName,
				bodyShape: lastWinner.outfit.bodyShape,
				wearables: lastWinner.outfit.wearables,
				hairColor: lastWinner.outfit.hairColor,
				skinColor: lastWinner.outfit.skinColor,
				emotes: []
			}, 200, () => {Tween.setScale(npcEntity!, Vector3.Zero(), scale, 500, EasingFunction.EF_EASEOUTBACK)})


			// Spawn the Winner! sign
			ShowWinnerLabel(npcEntity!)
		}, 50)
	}


	// MARK: Show Winner Label
	export function ShowWinnerLabel(playerEntity: Entity) {
		console.log("MannequinManager: ShowWinnerLabel")

		const entity = engine.addEntity()
		Transform.create(entity, {
			parent: playerEntity,
			position: Vector3.create(0, 0.25, 0),
			rotation: Quaternion.fromEulerDegrees(0, 180, 0),
		})
		GltfContainer.create(entity, {
			src: "assets/models/winner.gltf",
		})
		Billboard.create(entity, {
			billboardMode: BillboardMode.BM_Y,
		})

		utils.timers.setTimeout(() => {
			engine.removeEntity(entity)
		}, 30 * 1000)
	}
}