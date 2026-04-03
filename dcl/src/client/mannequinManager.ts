import { AvatarShape, Billboard, BillboardMode, engine, Entity, GltfContainer, InputAction, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

import { eventBus } from "src/shared/utils/eventBus"

import { ClientEvents } from "src/client/clientEvents"
import { ClientStore } from "src/client/clientStore"
import { OutfitManager } from "src/client/outfitManager"


export namespace MannequinManager {
	
	var npcRoot             : undefined | Entity     = undefined
	var npcBillboard        : undefined | Entity     = undefined
	var npcMannequin        : undefined | Entity     = undefined
	var npcPodium           : undefined | Entity     = undefined
	var npcBtnReset         : undefined | Entity     = undefined
	var npcBtnCopy          : undefined | Entity     = undefined
	var npcBtnSwap          : undefined | Entity     = undefined

	var isNPCMannequinVisible: boolean = true

	const clientStore: ClientStore = ClientStore.getInstance()


	export function init() {
		console.log("MannequinManager: init")

		eventBus.on(ClientEvents.OUTFIT_CHANGED, () => {
			ShowNPCMannequin()
		})
	}




	// MARK: Show NPC Mannequin
	export function ShowNPCMannequin() {
		isNPCMannequinVisible = true

		const position = Vector3.create(1.5, 0.25, 0)

		// Create the root element for the NPC Mannequin
		if (!npcRoot) {
			npcRoot = engine.addEntity()
			Transform.createOrReplace(npcRoot, {
				position: position,
				rotation: Quaternion.fromEulerDegrees(0, 0, 0),
				scale   : Vector3.create(1, 1, 1),
				parent  : engine.PlayerEntity,
			})
		}

		// Create the mannequin
		if (!npcMannequin) {
			npcMannequin = engine.addEntity()

			Transform.create(npcMannequin, {
				parent: npcRoot,
				rotation: Quaternion.fromEulerDegrees(0, 0, 0),
			})
		}

		console.log("MannequinManager: ShowNPCMannequin: Updating AvatarShape")
		AvatarShape.createOrReplace(npcMannequin, {
			id       : "npc_mannequin    ", // Trailing spaces are required to hide the nametag above the NPC
			name     : "",
			bodyShape: clientStore.getNPCBodyShape(),
			wearables: clientStore.getNPCWearables()?.map(w => w.urn) ?? [],
			emotes   : [],
			hairColor: clientStore.getNPCHairColor(),
			skinColor: clientStore.getNPCSkinColor(),
		})

		// Creat the billboard entity - anything which should always rotate to face the player gets parented to this
		if (!npcBillboard) {
			npcBillboard = engine.addEntity()
			Transform.create(npcBillboard, {
				parent: npcRoot,
			})
			Billboard.create(npcBillboard, {
				billboardMode: BillboardMode.BM_Y,
			})
		}

		// Create the podium
		if (!npcPodium) {
			npcPodium = engine.addEntity()
			Transform.createOrReplace(npcPodium, {
				parent  : npcBillboard,
			})
			GltfContainer.createOrReplace(npcPodium, {
				src: "assets/models/podiumnocollider.gltf",
			})
		}

		// MARK: Btn: Reset Outfit
		// Create the reset button
		if (!npcBtnReset) {
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
				() => { OutfitManager.RemoveOutfit() }
			)
		}

		// MARK: Btn: Copy Outfit
		// Create the copy outfit button
		if (!npcBtnCopy) {
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
				() => { OutfitManager.CopyMyOutfit() }
			)
		}

		// MARK: Btn: Swap Gender
		// Create the swap gender
		if (!npcBtnSwap) {
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
				() => { OutfitManager.SwapGender() }
			)
		}
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
