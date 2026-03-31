import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { AvatarEquippedData, AvatarShape, Billboard, BillboardMode, engine, Entity, GltfContainer, InputAction, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"

import { Wearable } from "./data/shopSlotData"
import { Outfit } from "../shared/types"
import { MessageType, room } from "../shared/room"
import { ClientStore } from "./clientStore"
import { GetWearableData } from "./utils"
import { eventBus } from "src/shared/utils/eventBus"
import { ClientEvents } from "./clientEvents"
import { ClientMessaging } from "./clientMessaging"

//const sceneMessageBus = new MessageBus()


export namespace OutfitManager {
	
	let userData            : undefined | any        = undefined
	let npcRoot             : undefined | Entity     = undefined
	let npcBillboard        : undefined | Entity     = undefined
	let npcMannequin        : undefined | Entity     = undefined
	let npcPodium           : undefined | Entity     = undefined
	let npcBtnReset         : undefined | Entity     = undefined
	let npcBtnCopy          : undefined | Entity     = undefined
	let npcBtnSwap          : undefined | Entity     = undefined

	let isWearableDataLoaded: boolean                = false
	let runUpdate           : boolean                = false

	let isNPCMannequinVisible: boolean = true

	const clientStore: ClientStore = ClientStore.getInstance()


	export function init() {
		console.log("OutfitManager: init")	
		InitUserWearables()
		
		// Re-trigger InitUserWearables every time the user equips a new wearable
		AvatarEquippedData.onChange(engine.PlayerEntity, (equipped) => {
			if (!equipped) return
			InitUserWearables(true)
		})
	}

	// MARK: Init User Wearables
	// Entry point: call once in main()
	async function InitUserWearables(forceRefresh: boolean = false): Promise<void> {
		if (isWearableDataLoaded && !forceRefresh) return

		try {
			userData = getPlayer()

			// Check if we got user data with wearables
			if (!userData?.wearables?.length) {
				console.log("OutfitManager: InitUserWearables: No wearables available")
				return
			}

			// Set the default player and NPC properties
			clientStore.setPlayerBodyShape(userData.avatar?.bodyShapeUrn || "urn:decentraland:off-chain:base-avatars:BaseMale")
			clientStore.setPlayerSkinColor(userData.avatar?.skinColor || Color3.create(0.5, 0.5, 0.5))
			clientStore.setPlayerHairColor(userData.avatar?.hairColor || Color3.create(0.5, 0.5, 0.5))
			clientStore.setNPCBodyShape(userData.avatar?.bodyShapeUrn || "urn:decentraland:off-chain:base-avatars:BaseMale")
			clientStore.setNPCSkinColor(userData.avatar?.skinColor || Color3.create(0.5, 0.5, 0.5))
			clientStore.setNPCHairColor(userData.avatar?.hairColor || Color3.create(0.5, 0.5, 0.5))

			// Fetch wearable data for each URN
			let playerWearables: Wearable[] = []
			const wearableUrns = userData.wearables
			
			for (const urn of wearableUrns) {
				const data = await GetWearableData(urn)
				playerWearables.push(data)
				//console.log("OutfitManager: InitUserWearables: got wearable data for", urn, ": ", JSON.stringify(data))
			}
			clientStore.setPlayerWearables([...playerWearables])
			clientStore.setNPCWearables([...playerWearables])

			isWearableDataLoaded = true

			console.log(
				"OutfitManager InitUserWearables: got",
				playerWearables.length,
				"wearables for the player"
			)

			if (isNPCMannequinVisible) {
				eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
			}
		} catch (err) {
			console.error("OutfitManager InitUserWearables: failed to load wearables", err)
		}
	}


	// MARK: Equip Wearable
	export async function EquipWearable(wearable: Wearable) {
		console.log("OutfitManager: EquipWearable: equipping wearable", wearable.name, wearable.category)

		// Make sure the mannequin exists
		if (!npcMannequin) {
			console.error("OutfitManager EquipWearable: npc mannequin not found")
			return
		}

		// Remove any existing wearables in the same category
		let currentWearables = [...clientStore.getNPCWearables()]
		for (const currentWearable of currentWearables) {
			if (currentWearable.category === wearable.category) {
				currentWearables.splice(currentWearables.indexOf(currentWearable), 1)
				break
			}
		}

		// Add the new wearable to the npc wearables
		currentWearables.push(wearable)
		clientStore.setNPCWearables([...currentWearables])

		// Let the host know about the new outfit
		ClientMessaging.RequestOutfitChange()

		// Fire the outfit changed event, which in turn updates the mannequin
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
	}

	// MARK: Set Hair Color
	export function SetHairColor(color: Color3) {
		console.log("OutfitManager: SetHairColor:", Color3.toHexString(color))
		clientStore.setNPCHairColor(color)

		// Let the host know about the new outfit
		ClientMessaging.RequestOutfitChange()
		
		// Fire the outfit changed event, which in turn updates the mannequin
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
	}

	// MARK: Set Skin Color
	export function SetSkinColor(color: Color3) {
		console.log("OutfitManager: SetSkinColor:", Color3.toHexString(color))

		clientStore.setNPCSkinColor(color)

		// Update the client store with the new outfit ands end it to the server
		ClientMessaging.RequestOutfitChange()

		// Fire the outfit changed event, which in turn updates the mannequin
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
	}

	

	// MARK: Copy Outfit
	export function CopyMyOutfit() {
		console.log("OutfitManager: CopyMyOutfit")
		clientStore.setNPCWearables([...clientStore.getPlayerWearables()])

		// Let the host know about the new outfit
		ClientMessaging.RequestOutfitChange()

		// Fire the outfit changed event, which in turn updates the mannequin
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
	}

	// MARK: Remove Outfit
	export function RemoveOutfit() {
		console.log("OutfitManager: RemoveOutfit")
		clientStore.setNPCWearables([])

		// Let the host know about the new outfit
		ClientMessaging.RequestOutfitChange()

		// Fire the outfit changed event, which in turn updates the mannequin
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
	}

	// MARK: Swap Gender
	export function SwapGender() {
		console.log("OutfitManager: SwapGender")

		const isMale = !clientStore.getNPCBodyShape().includes("Female")
		if (isMale) {
			clientStore.setNPCBodyShape("urn:decentraland:off-chain:base-avatars:BaseFemale")
		} else {
			clientStore.setNPCBodyShape("urn:decentraland:off-chain:base-avatars:BaseMale")
		}

		// Let the host know about the new outfit
		ClientMessaging.RequestOutfitChange()

		// Fire the outfit changed event, which in turn updates the mannequin
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
	}
}
