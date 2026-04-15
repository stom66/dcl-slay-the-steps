import { AvatarBase, AvatarEquippedData, engine } from "@dcl/sdk/ecs"
import { Color3 } from "@dcl/sdk/math"
import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'

import { eventBus } from "src/shared/utils/eventBus"

import { sfx } from "src/client/data/sfx"
import { Wearable } from "src/client/data/shopSlotData"
import { ClientEvents } from "src/client/clientEvents"
import { ClientMessaging } from "src/client/clientMessaging"
import { ClientStore } from "src/client/clientStore"
import { SoundManager } from "src/client/soundManager"
import { GetWearableData } from "src/client/utils"


export namespace OutfitManager {
	
	// MARK: Vars
	const clientStore: ClientStore = ClientStore.getInstance()

	var userData             : undefined | any = undefined
	var isWearableDataLoaded : boolean         = false
	var isNPCMannequinVisible: boolean         = true


	// MARK: Init
	export function init() {
		console.log("OutfitManager: init")

		// Add a small delay, to give the scene some time to finish loading. This helps ensure the NPC mannequin is visible on first load.
		utils.timers.setTimeout(() => {
			InitUserWearables()
		}, 1000)
		
		// Re-trigger InitUserWearables every time the user equips a new wearable
		AvatarEquippedData.onChange(engine.PlayerEntity, (equipped) => {
			if (!equipped) return
			InitUserWearables(true)
		})

	
		AvatarBase.onChange(engine.PlayerEntity, (body) => {
			if (!body) return
			clientStore.setPlayerBodyShape(body.bodyShapeUrn || "urn:decentraland:off-chain:base-avatars:BaseMale")
			clientStore.setPlayerSkinColor(body.skinColor || Color3.create(0.5, 0.5, 0.5))
			clientStore.setPlayerHairColor(body.hairColor || Color3.create(0.5, 0.5, 0.5))
		})
	}


	// MARK: Init User Wearables
	async function InitUserWearables(forceRefresh: boolean = false): Promise<void> {
		if (isWearableDataLoaded && !forceRefresh) return

		try {
			userData = getPlayer()

			// Retry until userData exists and wearables is present (empty [] is valid — no equipped wearables)
			if (!userData || userData.wearables == null) {
				console.log("OutfitManager: InitUserWearables: user data or wearables list not ready yet. userData:", JSON.stringify(userData))
				utils.timers.setTimeout(() => {
					InitUserWearables(true)
				}, 1000)
				return
			}

			// Set the player properties
			clientStore.setPlayerBodyShape(userData.avatar?.bodyShapeUrn || "urn:decentraland:off-chain:base-avatars:BaseMale")
			clientStore.setPlayerSkinColor(userData.avatar?.skinColor || Color3.create(0.5, 0.5, 0.5))
			clientStore.setPlayerHairColor(userData.avatar?.hairColor || Color3.create(0.5, 0.5, 0.5))

			// Fetch wearable data for each URN
			var playerWearables: Wearable[] = []
			const wearableUrns = userData.wearables
			
			for (const urn of wearableUrns) {
				const data = await GetWearableData(urn)
				playerWearables.push(data)
			}
			clientStore.setPlayerWearables([...playerWearables])

			// Set the NPC properties
			clientStore.setNPCBodyShape(clientStore.getPlayerBodyShape(), true)
			clientStore.setNPCSkinColor(clientStore.getPlayerSkinColor(), true)
			clientStore.setNPCHairColor(clientStore.getPlayerHairColor(), true)
			clientStore.setNPCWearables([], true)

			isWearableDataLoaded = true

			if (isNPCMannequinVisible) {
				eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
			}

			console.log("OutfitManager InitUserWearables: got", playerWearables.length, "wearables for the player")
		} catch (err) {
			console.error("OutfitManager InitUserWearables: failed to load wearables", err)
		}
	}


	// MARK: Equip Wearable
	export async function EquipWearable(wearable: Wearable) {
		console.log("OutfitManager: EquipWearable: equipping wearable", wearable.name, wearable.category)

		// Remove any existing wearables in the same category
		var currentWearables = [...clientStore.getNPCWearables()]
		for (const currentWearable of currentWearables) {
			if (currentWearable.category === wearable.category) {
				currentWearables.splice(currentWearables.indexOf(currentWearable), 1)
				break
			}
		}

		// Add the new wearable to the npc wearables
		currentWearables.push(wearable)
		clientStore.setNPCWearables([...currentWearables])

		SoundManager.PlaySound(sfx.equipWearable)
	}


	// MARK: Set Hair Color
	export function SetHairColor(color: Color3) {
		console.log("OutfitManager: SetHairColor:", Color3.toHexString(color))
		clientStore.setNPCHairColor(color)
		
		// Fire the outfit changed event, which in turn updates the mannequin
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
	}


	// MARK: Set Skin Color
	export function SetSkinColor(color: Color3) {
		console.log("OutfitManager: SetSkinColor:", Color3.toHexString(color))

		clientStore.setNPCSkinColor(color)

		// Update the client store with the new outfit ands end it to the server
		ClientMessaging.RequestOutfitChange()
	}


	// MARK: Copy Outfit
	export function CopyMyOutfit() {
		console.log("OutfitManager: CopyMyOutfit")
		clientStore.setNPCWearables([...clientStore.getPlayerWearables()])
	}


	// MARK: Remove Outfit
	export function RemoveOutfit() {
		console.log("OutfitManager: RemoveOutfit")
		clientStore.setNPCWearables([])
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
	}
}
