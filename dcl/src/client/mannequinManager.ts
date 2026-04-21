import { Animator, AvatarShape, Billboard, BillboardMode, ColliderLayer, EasingFunction, engine, Entity, GltfContainer, InputAction, Material, MeshRenderer, PlayerIdentityData, pointerEventsSystem, RaycastQueryType, raycastSystem, Tags, Transform, Tween } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import * as utils from "@dcl-sdk/utils"

import { eventBus } from "src/shared/utils/eventBus"

import { sfx } from "src/client/data/sfx"
import { ClientEvents } from "src/client/clientEvents"
import { ClientStore } from "src/client/clientStore"
import { OutfitManager } from "src/client/outfitManager"
import { SoundManager } from "./soundManager"
import { avatarManager } from "./avatarManager"
import { GameStatus } from "src/shared/enums"
import { ClientState } from "src/shared/types"
import { userProfileCache } from "src/shared/utils/userProfileCache"
import { Tutorial } from "./tutorial"


export namespace MannequinManager {
	// MARK: Event bindings
	eventBus.on(ClientEvents.OUTFIT_CHANGED, () => {
		console.log("MannequinManager: OUTFIT_CHANGED event received")
		if (isNPCMannequinVisible) ShowNPCMannequin()
	})

	
	eventBus.on(ClientEvents.JOIN_AS_SPECTATOR, () => {
		HideNPCMannequin()
	})	

	eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
		if (data.serverStatus == GameStatus.LOBBY) {
			ShowNPCMannequin()
		}

		if (data.serverStatus == GameStatus.GAME_ENDED) {

			ShowNPCMannequin()

			const sortedResults = clientStore.getSortedVoteResults()
			if (sortedResults.length > 0) {
				const winnerId = sortedResults[0][0]
				const playerEntity = userProfileCache.getPlayerEntity(winnerId)
				if (playerEntity) {
					ShowWinnerLabel(playerEntity)
				}
			}
		}

		if (
			(data.serverStatus == GameStatus.ROUND_ACTIVE || data.serverStatus == GameStatus.STARTED) && 
			(clientStore.isEnrolledInGame() || clientStore.isSpectatorInGame())
		) {
			HideNPCMannequin()
		}
	})

	eventBus.on(ClientEvents.SHOW_DRESS_ME_HINT, () => {
		ShowDressMeHint()
	})

	
	// MARK: Vars
	var npcRoot              : undefined | Entity = undefined
	var npcBillboard         : undefined | Entity = undefined
	var npcMannequin         : undefined | Entity = undefined
	var npcPodium            : undefined | Entity = undefined
	var npcHint              : undefined | Entity = undefined
	//var npcBtnReset          : undefined | Entity = undefined
	//var npcBtnCopy           : undefined | Entity = undefined
	//var npcBtnSwap           : undefined | Entity = undefined

	var isNPCMannequinVisible: boolean            = false
	var showHint             : boolean            = true

	const showHintDelay      : number             = 2 * 1000
	const showHintDuration   : number             = 10 * 1000

	const clientStore        : ClientStore        = ClientStore.getInstance()

	export var avatarHasLoaded  : boolean            = false


	// MARK: Init
	export function init() {
		console.log("MannequinManager: init")
		utils.timers.setTimeout(() => {
			ShowNPCMannequin()
		}, 1000)
	}

	// MARK: Show NPC Mannequin
	export function ShowNPCMannequin() {
		console.log("MannequinManager: ShowNPCMannequin")
		isNPCMannequinVisible = true

		const position = Vector3.create(1.5, 0.25, 0)

		// Create the root element for the NPC Mannequin
		if (!npcRoot || !Transform.getMutableOrNull(npcRoot)) {
			console.log("MannequinManager: ShowNPCMannequin: creating missing npcRoot")
			npcRoot = engine.addEntity()
			Tags.add(npcRoot, "npcRoot")
			Transform.createOrReplace(npcRoot, {
				position: position,
				rotation: Quaternion.fromEulerDegrees(0, 0, 0),
				scale   : Vector3.create(1, 1, 1),
				parent  : engine.PlayerEntity,
			})
		}

		// Create the mannequin
		if (!npcMannequin || !Transform.getMutableOrNull(npcMannequin)) {
			console.log("MannequinManager: ShowNPCMannequin: creating missing npcMannequin")
			npcMannequin = engine.addEntity()
			Tags.add(npcMannequin, "npcMannequin")
			Transform.create(npcMannequin, {
				parent: npcRoot,
				rotation: Quaternion.fromEulerDegrees(0, 0, 0),
			})
		}

		avatarManager.SpawnAvatar(npcMannequin, {
			id       : "npc_mannequin    ", // Trailing spaces are required to hide the nametag above the NPC
			name     : "",
			bodyShape: clientStore.getNPCBodyShape(),
			wearables: clientStore.getNPCWearables()?.map(w => w.urn) ?? [],
			emotes   : ["urn:decentraland:off-chain:base-emotes:wave"],
			hairColor: clientStore.getNPCHairColor(),
			skinColor: clientStore.getNPCSkinColor(),
		}, 1000, () => {
			avatarHasLoaded = true

			// This is where we trigger the tutorial. It's not great to do it here, but it's the only way to ensure the mannequin is visible when the tutorial is triggered.
			//Tutorial.TriggerTutorial()
		})

		// Creat the billboard entity - anything which should always rotate to face the player gets parented to this
		if (!npcBillboard || !Transform.getMutableOrNull(npcBillboard)) {
			npcBillboard = engine.addEntity()
			Transform.create(npcBillboard, {
				parent: npcRoot,
			})
			Billboard.create(npcBillboard, {
				billboardMode: BillboardMode.BM_Y,
			})
		}

		// Create the podium
		if (!npcPodium || !Transform.getMutableOrNull(npcPodium)) {
			npcPodium = engine.addEntity()
			Tags.add(npcPodium, "npcPodium")
			Transform.createOrReplace(npcPodium, {
				parent  : npcRoot
				//parent  : npcBillboard
			})
			GltfContainer.createOrReplace(npcPodium, {
				src: "assets/models/podiumnocollider.gltf",
			})
		}


		// MARK: Btn: Reset Outfit
		// Create the reset button
/* 		if (!npcBtnReset || !Transform.getMutableOrNull(npcBtnReset)) {
			npcBtnReset = engine.addEntity()
			Transform.create(npcBtnReset, {
				parent  : npcBillboard,
				rotation: Quaternion.fromEulerDegrees(0, 180, 0),
			})
			Tags.add(npcBtnReset, "npcBtnReset")
			GltfContainer.create(npcBtnReset, {
				src: "assets/models/btnReset.gltf",
			})
			pointerEventsSystem.onPointerDown(
				{ 
					entity: npcBtnReset, 
					opts: { 
						button: InputAction.IA_POINTER,
						hoverText: "Reset all wearables",
						maxDistance: 4,
					}
				}, 
				() => { 
					OutfitManager.RemoveOutfit()
					SoundManager.PlaySound(sfx.buttons)
				}
			)
		} */

		// MARK: Btn: Copy Outfit
		// Create the copy outfit button
/* 		if (!npcBtnCopy || !Transform.getMutableOrNull(npcBtnCopy)) {
			npcBtnCopy = engine.addEntity()
			Transform.create(npcBtnCopy, {
				parent  : npcBillboard,
				rotation: Quaternion.fromEulerDegrees(0, 180, 0),
			})
			Tags.add(npcBtnCopy, "npcBtnCopy")
			GltfContainer.create(npcBtnCopy, {
				src: "assets/models/btnCopy.gltf",
			})
			pointerEventsSystem.onPointerDown(
				{ 
					entity: npcBtnCopy, 
					opts: { 
						button: InputAction.IA_POINTER,
						hoverText: "Copy my wearables",
						maxDistance: 4,
					}
				}, 
				() => { 
					OutfitManager.CopyMyOutfit()
					SoundManager.PlaySound(sfx.buttons)
				}
			)
		} */

		// MARK: Btn: Swap Gender
		// Create the swap gender
/* 		if (!npcBtnSwap || !Transform.getMutableOrNull(npcBtnSwap)) {
			npcBtnSwap = engine.addEntity()
			Transform.create(npcBtnSwap, {
				parent  : npcBillboard,
				rotation: Quaternion.fromEulerDegrees(0, 180, 0),
			})
			Tags.add(npcBtnSwap, "npcBtnSwap")
			GltfContainer.create(npcBtnSwap, {
				src: "assets/models/btnGenderSwap.gltf",
			})
			pointerEventsSystem.onPointerDown(
				{ 
					entity: npcBtnSwap, 
					opts: { 
						button: InputAction.IA_POINTER,
						hoverText: "Swap gender",
						maxDistance: 4,
					}
				}, 
				() => { 
					OutfitManager.SwapGender()
					SoundManager.PlaySound(sfx.buttons)
				}
			)
		} */
	}


	// MARK: Show Dress Me Hint
	export function ShowDressMeHint() {
		// Create the hint
		//if (showHint) {
		if (!npcHint || !Transform.getMutableOrNull(npcHint)) {
			npcHint = engine.addEntity()
			Transform.create(npcHint, {
				parent  : npcBillboard,
				rotation: Quaternion.fromEulerDegrees(0, 180, 0),
				scale   : Vector3.create(0, 0, 0),
			})
			GltfContainer.create(npcHint, {
				src: "assets/models/dressThis.gltf",
			})
			Animator.create(npcHint, {
				states: [
					{
						clip: "Idle",
						playing: true,
						loop: true,
					}
				]
			})
			Tween.setScale(npcHint!, Vector3.create(0,0,0), Vector3.create(1,1,1), 500)

			utils.timers.setTimeout(() => {
				showHint = false
				Tween.setScale(npcHint!, Vector3.create(1, 1, 1), Vector3.create(0, 0, 0), 600, EasingFunction.EF_EASEINQUAD)
				utils.timers.setTimeout(() => {
					engine.removeEntity(npcHint!)
					npcHint = undefined
				}, 650)
			}, showHintDuration)
		}
		//}
	}

	// MARK: Show Winner Label
	export function ShowWinnerLabel(playerEntity: Entity) {
		console.log("MannequinManager: ShowWinnerLabel")

		const entity = engine.addEntity()
		Transform.create(entity, {
			parent: npcBillboard,
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
		}, 10 * 1000)
	}


	// MARK: Hide NPC Mannequin
	export function HideNPCMannequin() {
		console.log("MannequinManager: HideNPCMannequin")
		isNPCMannequinVisible = false

		if (npcMannequin) {
			engine.removeEntity(npcMannequin)
			npcMannequin = undefined
		}
		if (npcPodium) {
			engine.removeEntity(npcPodium)
			npcPodium = undefined
		}

		/* 
		if (npcBtnReset) {
			engine.removeEntity(npcBtnReset)
			npcBtnReset = undefined
		}
		if (npcBtnCopy) {
			engine.removeEntity(npcBtnCopy)
			npcBtnCopy = undefined
		}
		if (npcBtnSwap) {
			engine.removeEntity(npcBtnSwap)
			npcBtnSwap = undefined
		}
		 */
	}
}
