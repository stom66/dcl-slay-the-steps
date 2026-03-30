import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { AvatarEquippedData, AvatarShape, engine, Entity, GltfContainer, InputAction, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"

import { Wearable } from "./data/shopSlotData"
import { Outfit } from "../shared/types"
import { MessageType, room } from "../shared/room"
import { ClientStore } from "./clientStore"
import { GetWearableData } from "./utils"

//const sceneMessageBus = new MessageBus()


export namespace OutfitManager {
	
	let userData            : undefined | any        = undefined
	let npcMannequin        : undefined | Entity     = undefined
	let npcPodium           : undefined | Entity     = undefined
	let npcBtnReset         : undefined | Entity     = undefined
	let npcBtnCopy          : undefined | Entity     = undefined
	let npcBtnSwap          : undefined | Entity     = undefined

	let isWearableDataLoaded: boolean                = false
	let runUpdate           : boolean                = false

	const clientStore: ClientStore = ClientStore.getInstance()


	export function init() {
		console.log("OutfitManager: init")	
		InitUserWearables()
		
		// Re-trigger InitUserWearables every time the user equips a new wearable
		AvatarEquippedData.onChange(engine.PlayerEntity, (equipped) => {
			if (!equipped) return
			InitUserWearables(true)
		})
		
		engine.addSystem(System_UpdateMannequin)
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
				() => { RemoveOutfit() }
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

		console.log("OutfitManager: ShowNPCMannequin: Updating AvatarShape")
		AvatarShape.createOrReplace(npcMannequin, {
			id       : "npc_mannequin    ", // Trailing spaces are required to hide the nametag above the NPC
			name     : "",
			bodyShape: clientStore.getNPCBodyShape(),
			wearables: clientStore.getNPCWearables()?.map(w => w.urn) ?? [],
			emotes   : [],
			hairColor: clientStore.getNPCHairColor(),
			skinColor: clientStore.getNPCSkinColor(),
		})

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

	
	// MARK: Remove Outfit
	function RemoveOutfit() {
		console.log("OutfitManager: RemoveOutfit")
		clientStore.setNPCWearables([])

		// Let the host know about the new outfit
		RequestOutfitChange()

		ShowNPCMannequin()
	}

	// MARK: Copy Outfit
	function CopyMyOutfit() {
		console.log("OutfitManager: CopyMyOutfit")
		clientStore.setNPCWearables([...clientStore.getPlayerWearables()])

		// Let the host know about the new outfit
		RequestOutfitChange()

		ShowNPCMannequin()
	}

	// MARK: Swap Gender
	function SwapGender() {
		console.log("OutfitManager: SwapGender")

		const isMale = !clientStore.getNPCBodyShape().includes("Female")
		if (isMale) {
			clientStore.setNPCBodyShape("urn:decentraland:off-chain:base-avatars:BaseFemale")
		} else {
			clientStore.setNPCBodyShape("urn:decentraland:off-chain:base-avatars:BaseMale")
		}

		// Let the host know about the new outfit
		RequestOutfitChange()

		ShowNPCMannequin()
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
		RequestOutfitChange()

		// Update the mannequin with the new wearables
		ShowNPCMannequin()
	}

	// MARK: Set Hair Color
	export function SetHairColor(color: Color3) {
		console.log("OutfitManager: SetHairColor:", Color3.toHexString(color))
		clientStore.setNPCHairColor(color)

		// Let the host know about the new outfit
		RequestOutfitChange()
		
		// Update the mannequin with the new color
		ShowNPCMannequin()
	}

	// MARK: Set Skin Color
	export function SetSkinColor(color: Color3) {
		console.log("OutfitManager: SetSkinColor:", Color3.toHexString(color))

		clientStore.setNPCSkinColor(color)

		// Update the client store with the new outfit ands end it to the server
		RequestOutfitChange()

		// Update the mannequin with the new color
		ShowNPCMannequin()
	}

	// MARK: Request Outfit Change
	function RequestOutfitChange() {
		// Ignore if we're not enrolled in the game
		if (!clientStore.isEnrolledInGame()) return

		// Let the server know about the new outfit
		const outfit: Outfit = {
			wearables: clientStore.getNPCWearables().map(w => w.urn),
			bodyShape: clientStore.getNPCBodyShape(),
			hairColor: clientStore.getNPCHairColor(),
			skinColor: clientStore.getNPCSkinColor(),
		}
		room.send(MessageType.REQUEST_OUTFIT_UPDATE, outfit)
	}
}
