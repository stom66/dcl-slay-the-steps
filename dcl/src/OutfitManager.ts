import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { Animator, AvatarEquippedData, AvatarShape, engine, Entity, GltfContainer, InputAction, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"
import { Wearable } from "./data/shopSlotData"
import { GetWearableData } from "./utils"
import { MessageBus } from "@dcl/sdk/message-bus"
import { MessageBusEvents } from "./_settings"

const sceneMessageBus = new MessageBus()

export type Outfit = {
	userId   : string,
	wearables: Wearable[],
	bodyShape: string,
	hairColor: Color3,
	skinColor: Color3
}


export namespace OutfitManager {
	
	let userData            : undefined | any        = undefined
	let npcMannequin        : undefined | Entity     = undefined
	let npcPodium           : undefined | Entity     = undefined
	let npcBtnReset         : undefined | Entity     = undefined
	let npcBtnCopy          : undefined | Entity     = undefined
	let npcBtnSwap          : undefined | Entity     = undefined

	let playerWearables     : undefined | Wearable[] = undefined // What the player is currently wearing
	let npcOutfit           : Outfit     = { userId: "", wearables: [], bodyShape: "", hairColor: Color3.Green(), skinColor: Color3.Green() }

	let isWearableDataLoaded: boolean                = false
	let runUpdate           : boolean                = false


	export function init() {
		console.log("OutfitManager init")	
		
		AvatarEquippedData.onChange(engine.PlayerEntity, (equipped) => {
			if (!equipped) return
			InitUserWearables(true)
		})
		
		engine.addSystem(System_UpdateMannequin)

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

			// Fetch wearable data for each URN
			playerWearables = []
			const wearableUrns = userData.wearables
			
			for (const urn of wearableUrns) {
				const data = await GetWearableData(urn)
				playerWearables.push(data)
				//console.log("OutfitManager: InitUserWearables: got wearable data for", urn, ": ", JSON.stringify(data))
			}

			// Update other avatar properties
			//npcBodyShape = userData.avatar?.bodyShapeUrn || "urn:decentraland:off-chain:base-avatars:BaseMale"
			//npcHairColor = userData.avatar?.hairColor || Color3.create(0.5, 0.5, 0.5)
			//npcOutfit.wearables = playerWearables.map(w => ({ ...w }))

			npcOutfit = {
				userId   : userData.userId,
				wearables: playerWearables.map(w => w),
				bodyShape: userData.avatar?.bodyShapeUrn || "urn:decentraland:off-chain:base-avatars:BaseMale",
				hairColor: userData.avatar?.hairColor || Color3.create(0.5, 0.5, 0.5),
				skinColor: userData.avatar?.skinColor || Color3.create(0.5, 0.5, 0.5)
			}
			isWearableDataLoaded = true

			console.log(
				"OutfitManager InitUserWearables: got",
				playerWearables.length,
				"wearables for the player"
			)
		} catch (err) {
			console.error("OutfitManager InitUserWearables: failed to load wearables", err)
		}
	}

	// MARK: Update
	const System_UpdateMannequin = (dt: number) => {
		if (!runUpdate) return
		if (!npcMannequin) return
		if (!npcPodium) return
		if (!npcBtnReset) return
		if (!npcBtnCopy) return
		if (!npcBtnSwap) return

		// Get camera position (what the player sees)
		const cameraTransform = Transform.get(engine.CameraEntity)
		const cameraPosition = cameraTransform.position

		// Get player world rotation (buttons are parented to player, so we need to account for this)
		const playerWorldRotation = utils.getWorldRotation(engine.PlayerEntity)

		// Helper function to get inverse quaternion (for unit quaternions, inverse = conjugate)
		const quaternionInverse = (q: Quaternion): Quaternion => {
			return Quaternion.create(-q.x, -q.y, -q.z, q.w)
		}

		// Rotate buttons to face the camera (only around Y axis)
		const rotateButtonToFaceCamera = (buttonEntity: Entity) => {
			if (!runUpdate) return
			const buttonWorldPos = utils.getWorldPosition(buttonEntity)
			const direction = Vector3.subtract(cameraPosition, buttonWorldPos)
			
			// Project direction onto XZ plane (ignore Y component) for Y-axis only rotation
			const directionXZ = Vector3.create(direction.x, 0, direction.z)
			const normalizedXZ = Vector3.normalize(directionXZ)
			
			// Calculate Y-axis rotation angle using atan2
			const yAngle = Math.atan2(normalizedXZ.x, normalizedXZ.z)
			
			// Create quaternion that only rotates around Y axis
			const worldLookRotation = Quaternion.fromEulerDegrees(0, yAngle * (180 / Math.PI), 0)
			
			// Convert world rotation to local rotation (relative to player)
			// localRotation = inverse(playerWorldRotation) * worldRotation
			const playerRotationInverse = quaternionInverse(playerWorldRotation)
			const localRotation = Quaternion.multiply(playerRotationInverse, worldLookRotation)
			
			const buttonTransform = Transform.getMutableOrNull(buttonEntity)
			if (buttonTransform) buttonTransform.rotation = localRotation
		
		}

		rotateButtonToFaceCamera(npcBtnReset)
		rotateButtonToFaceCamera(npcBtnCopy)
		rotateButtonToFaceCamera(npcBtnSwap)
	}




	// MARK: Show NPC Mannequin
	export function ShowNPCMannequin() {
		
		runUpdate = false

		const position = Vector3.create(1.5, 0.25, 0)
		
		// Create the podium
		if (!npcPodium) {
			npcPodium = engine.addEntity()
			Transform.createOrReplace(npcPodium, {
				position: position,
				rotation: Quaternion.fromEulerDegrees(0, 0, 0),
				scale   : Vector3.create(1, 1, 1),
				parent  : engine.PlayerEntity,
			})
			GltfContainer.createOrReplace(npcPodium, {
				src: "assets/models/podiumnocollider.gltf",
			})
		}

		// Create the reset button
		if (!npcBtnReset) {
			npcBtnReset = engine.addEntity()
			Transform.create(npcBtnReset, {
				parent  : npcPodium,
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
				() => { ResetOutfit() }
			)
		}

		// Create the copy outfit button
		if (!npcBtnCopy) {
			npcBtnCopy = engine.addEntity()
			Transform.create(npcBtnCopy, {
				parent  : npcPodium,
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
				() => { CopyMyOutfit() }
			)
		}

		// Create the swap gender
		if (!npcBtnSwap) {
			npcBtnSwap = engine.addEntity()
			Transform.create(npcBtnSwap, {
				parent  : npcPodium,
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
				() => { SwapGender() }
			)
		}

		// Create the mannequin
		if (!npcMannequin) {
			npcMannequin = engine.addEntity()

			Transform.create(npcMannequin, {
				parent: npcPodium,
			})
		}

		AvatarShape.createOrReplace(npcMannequin, {
			id       : "npc_mannequin    ",
			name     : "",
			bodyShape: npcOutfit?.bodyShape,
			wearables: npcOutfit?.wearables?.map(w => w.urn) ?? [],
			emotes   : [],
			hairColor: npcOutfit.hairColor,
			skinColor: npcOutfit.skinColor,
		})
	
		// Attempt to stop walking animation on character but doesn't work
/* 		Animator.createOrReplace(npcMannequin, {
			states: [
			  {
				clip: 'idle',
				playing: true,
				loop: true
			  }
			]
		}) */
		runUpdate = true

	}

	// MARK: Hide NPC Mannequin
	export function HideNPCMannequin() {
		runUpdate = false
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

	// MARK: Button funcs


	function ResetOutfit() {
		console.log("OutfitManager ResetOutfit")
		npcOutfit.wearables = []
		//HideNPCMannequin()
		ShowNPCMannequin()
	}

	function CopyMyOutfit() {
		console.log("OutfitManager CopyMyOutfit")
		npcOutfit.wearables = playerWearables?.map(w => w) ?? []
		//HideNPCMannequin()
		ShowNPCMannequin()
	}

	function SwapGender() {
		console.log("OutfitManager SwapGender")
		// if the current npcBodyShape contains "Female" then set it to "BaseMale"
		// otherwise set it to "BaseFemale"
		if (npcOutfit?.bodyShape?.includes("Female")) {
			npcOutfit.bodyShape = "urn:decentraland:off-chain:base-avatars:BaseMale"
		} else {
			npcOutfit.bodyShape = "urn:decentraland:off-chain:base-avatars:BaseFemale"
		}

		runUpdate = false
		ShowNPCMannequin()

	}


	// MARK: Util

	export function GetCurrentOutfit(): Outfit {
		return npcOutfit
	}

/* 	GetCurrentWearables(): Wearable[] {
		return npcOutfit.wearables?.map(w => w) ?? []
	}
	GetCurrentBodyShape(): string {
		return npcBodyShape ?? "urn:decentraland:off-chain:base-avatars:BaseMale"
	}
	GetCurrentHairColor(): Color3 {
		return npcHairColor ?? Color3.create(0.5, 0.5, 0.5)
	} */

	// MARK: Equip Wearable
	export async function EquipWearable(wearable: Wearable) {
		console.log("OutfitManager EquipWearable: equipping wearable", wearable.name, wearable.category)

		// Make sure the mannequin exists
		if (!npcMannequin) {
			console.error("OutfitManager EquipWearable: npc mannequin not found")
			return
		}

		// Make sure the npc wearables exist
		if (!npcOutfit.wearables) {
			console.error("OutfitManager EquipWearable: npcOutfit.wearables not found")
			return
		}

		// Remove any existing wearables in the same category
		for (const currentWearable of npcOutfit.wearables) {
			if (currentWearable.category === wearable.category) {
				npcOutfit.wearables.splice(npcOutfit.wearables.indexOf(currentWearable), 1)
				break
			}
		}

		// Add the new wearable to the npc wearables
		npcOutfit.wearables.push(wearable)

		// Update the mannequin with the new wearables
		ShowNPCMannequin()

		// Let the host know about the new outfit
		NotifyOutfitChange()
	}

	// MARK: Set Hair Color
	export function SetHairColor(color: Color3) {
		console.log("OutfitManager SetHairColor:", Color3.toHexString(color))
		npcOutfit.hairColor = color

		// Update the mannequin with the new color
		ShowNPCMannequin()

		// Let the host know about the new outfit
		NotifyOutfitChange()
	}

	// MARK: Set Skin Color
	export function SetSkinColor(color: Color3) {
		console.log("OutfitManager SetSkinColor:", Color3.toHexString(color))
		npcOutfit.skinColor = color

		// Update the mannequin with the new color
		ShowNPCMannequin()

		// Let the host know about the new outfit
		NotifyOutfitChange()
	}

	function NotifyOutfitChange() {
		// Let the host know about the new outfit
		sceneMessageBus.emit(MessageBusEvents.NOTIFY_SERVER_OUTFIT, npcOutfit)
	}
}
