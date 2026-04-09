import { Animator, AvatarShape, Billboard, BillboardMode, ColliderLayer, EasingFunction, engine, Entity, GltfContainer, InputAction, Material, MeshRenderer, PlayerIdentityData, pointerEventsSystem, RaycastQueryType, raycastSystem, Transform, Tween } from "@dcl/sdk/ecs"
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


export namespace MannequinManager {
	// MARK: Event bindings
	eventBus.on(ClientEvents.OUTFIT_CHANGED, () => {
		console.log("MannequinManager: OUTFIT_CHANGED event received")
		ShowNPCMannequin()
	})

	eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
		if (data.serverStatus == GameStatus.GAME_ENDED) {
			const sortedResults = clientStore.getSortedVoteResults()
			const winnerId = sortedResults[0][0]
			const playerEntity = userProfileCache.getPlayerEntity(winnerId)
			if (playerEntity) {
				ShowWinnerLabel(playerEntity)
			}
		}
	})

	
	// MARK: Vars
	var npcRoot              : undefined | Entity = undefined
	var npcFront             : undefined | Entity = undefined // used for raycast detection of mannequin
	var npcBack              : undefined | Entity = undefined // used for raycast detection of mannequin
	var npcBillboard         : undefined | Entity = undefined
	var npcMannequin         : undefined | Entity = undefined
	var npcPodium            : undefined | Entity = undefined
	var npcHint		         : undefined | Entity = undefined
	var npcBtnReset          : undefined | Entity = undefined
	var npcBtnCopy           : undefined | Entity = undefined
	var npcBtnSwap           : undefined | Entity = undefined

	var isNPCMannequinVisible: boolean            = true
	var showHint			 : boolean            = true

	const showHintDelay: number = 2 * 1000
	const showHintDuration: number = 10 * 1000

	const clientStore: ClientStore = ClientStore.getInstance()


	// MARK: Init
	export function init() {
		console.log("MannequinManager: init")
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
			Transform.createOrReplace(npcRoot, {
				position: position,
				rotation: Quaternion.fromEulerDegrees(0, 0, 0),
				scale   : Vector3.create(1, 1, 1),
				parent  : engine.PlayerEntity,
			})
		}

			// Create the front raycast entity
			if (!npcFront || !Transform.getMutableOrNull(npcFront)) {
				console.log("MannequinManager: ShowNPCMannequin: creating missing npcFront")
				npcFront = engine.addEntity()
				Transform.create(npcFront, {
					parent: npcRoot,
					scale: Vector3.create(0.25, 0.25, 0.25),
					position: Vector3.create(0, 1.25, 1),
				})
				//MeshRenderer.setSphere(npcFront)
			}

			// Create the back raycast entity
			if (!npcBack || !Transform.getMutableOrNull(npcBack)) {
				console.log("MannequinManager: ShowNPCMannequin: creating missing npcBack")
				npcBack = engine.addEntity()
				Transform.create(npcBack, {
					parent: npcRoot,
					scale: Vector3.create(0.25, 0.25, 0.25),
					position: Vector3.create(0, 1.25, -1),
				})
				//MeshRenderer.setSphere(npcBack)
			}

		// Create the mannequin
		if (!npcMannequin || !Transform.getMutableOrNull(npcMannequin)) {
			console.log("MannequinManager: ShowNPCMannequin: creating missing npcMannequin")
			npcMannequin = engine.addEntity()

			Transform.create(npcMannequin, {
				parent: npcRoot,
				rotation: Quaternion.fromEulerDegrees(0, 0, 0),
			})
		}

		if (!AvatarShape.getOrNull(npcMannequin)) {
			avatarManager.SpawnAvatar(npcMannequin, {
				id       : "npc_mannequin    ", // Trailing spaces are required to hide the nametag above the NPC
				name     : "",
				bodyShape: clientStore.getNPCBodyShape(),
				wearables: clientStore.getNPCWearables()?.map(w => w.urn) ?? [],
				emotes   : [],
				hairColor: clientStore.getNPCHairColor(),
				skinColor: clientStore.getNPCSkinColor(),
			}, 1000)
		}

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
			Transform.createOrReplace(npcPodium, {
				parent  : npcBillboard,
			})
			GltfContainer.createOrReplace(npcPodium, {
				src: "assets/models/podiumnocollider.gltf",
			})
		}

		// Create the hint
		if (showHint) {
			if (!npcHint || !Transform.getMutableOrNull(npcHint)) {
				npcHint = engine.addEntity()
				Transform.create(npcHint, {
					parent  : npcPodium,
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
				utils.timers.setTimeout(() => {
					Tween.setScale(npcHint!, Vector3.create(0,0,0), Vector3.create(1,1,1), 500)
				}, showHintDelay)

				utils.timers.setTimeout(() => {
					showHint = false
					Tween.setScale(npcHint!, Vector3.create(1, 1, 1), Vector3.create(0, 0, 0), 600, EasingFunction.EF_EASEINQUAD)
				}, showHintDuration + showHintDelay)
			}
		}


		// MARK: Btn: Reset Outfit
		// Create the reset button
		if (!npcBtnReset || !Transform.getMutableOrNull(npcBtnReset)) {
			npcBtnReset = engine.addEntity()
			Transform.create(npcBtnReset, {
				parent  : npcBillboard,
				rotation: Quaternion.fromEulerDegrees(0, 180, 0),
			})
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
		}

		// MARK: Btn: Copy Outfit
		// Create the copy outfit button
		if (!npcBtnCopy || !Transform.getMutableOrNull(npcBtnCopy)) {
			npcBtnCopy = engine.addEntity()
			Transform.create(npcBtnCopy, {
				parent  : npcBillboard,
				rotation: Quaternion.fromEulerDegrees(0, 180, 0),
			})
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
		}

		// MARK: Btn: Swap Gender
		// Create the swap gender
		if (!npcBtnSwap || !Transform.getMutableOrNull(npcBtnSwap)) {
			npcBtnSwap = engine.addEntity()
			Transform.create(npcBtnSwap, {
				parent  : npcBillboard,
				rotation: Quaternion.fromEulerDegrees(0, 180, 0),
			})
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
		}
	}


	// MARK: Show Winner Label
	export function ShowWinnerLabel(playerEntity: Entity) {
		console.log("MannequinManager: ShowWinnerLabel")

		const entity = engine.addEntity()
		Transform.create(entity, {
			parent: playerEntity,
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
		isNPCMannequinVisible = false

		if (npcMannequin) {
			engine.removeEntity(npcMannequin)
			npcMannequin = undefined
		}
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
		if (npcPodium) {
			engine.removeEntity(npcPodium)
			npcPodium = undefined
		}
	}
}
