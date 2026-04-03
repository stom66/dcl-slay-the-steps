import { getPlayer } from "@dcl/sdk/players"
import { AvatarBase, AvatarEquippedData, engine, Entity } from "@dcl/sdk/ecs"
import { Color3 } from "@dcl/sdk/math"

import { eventBus } from "src/shared/utils/eventBus"
import { GetWearableData } from "src/client/utils"
import { Wearable } from "src/client/data/shopSlotData"
import { ClientStore } from "src/client/clientStore"
import { ClientEvents } from "src/client/clientEvents"
import { ClientMessaging } from "src/client/clientMessaging"


export namespace OutfitManager {
	
	var userData             : undefined | any = undefined
	var isWearableDataLoaded : boolean         = false
	var isNPCMannequinVisible: boolean         = true

	const clientStore: ClientStore = ClientStore.getInstance()


	export function init() {
		console.log("OutfitManager: init")	
		InitUserWearables()
		
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
			var playerWearables: Wearable[] = []
			const wearableUrns = userData.wearables
			
			for (const urn of wearableUrns) {
				const data = await GetWearableData(urn)
				playerWearables.push(data)
			}
			clientStore.setPlayerWearables([...playerWearables])
			clientStore.setNPCWearables([...playerWearables])

			isWearableDataLoaded = true

			if (isNPCMannequinVisible) {
				eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
			} // TODO: Redundandt? event gets triggers by the calls to clientStore above, so this might not be needed

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
