import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { Animator, AvatarEquippedData, AvatarShape, engine, Entity, GltfContainer, InputAction, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"
import { Wearable } from "./shopSlotData"
import { GetWearableData, LoadUserData } from "./utils"
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


class OutfitManager {
	
	userData            : undefined | any        = undefined
	npcMannequin        : undefined | Entity     = undefined
	npcPodium           : undefined | Entity     = undefined
	npcBtnReset         : undefined | Entity     = undefined
	npcBtnCopy          : undefined | Entity     = undefined
	npcBtnSwap          : undefined | Entity     = undefined

	playerWearables     : undefined | Wearable[] = undefined // What the player is currently wearing
	npcOutfit           : Outfit     = { userId: "", wearables: [], bodyShape: "", hairColor: Color3.Green(), skinColor: Color3.Green() }
	//npcWearables        : undefined | Wearable[] = undefined // What their mannequin is wearing (starts off same as player)
	//npcBodyShape        : undefined | string     = "BaseMale" // What their mannequin's body shape is
	//npcHairColor        : undefined | Color3     = Color3.create(0.5, 0.5, 0.5) // What their mannequin's hair color is

	isWearableDataLoaded: boolean                = false
	runUpdate           : boolean                = false

	constructor() { }

	init() {
		console.log("OutfitManager init")	
		this.InitUserWearables()

		AvatarEquippedData.onChange(engine.PlayerEntity, (equipped) => {
			if (!equipped) return
			this.InitUserWearables(true)
		})

		engine.addSystem(this.System_UpdateMannequin)
	}

	// MARK: Init User Wearables
	// Entry point: call once in main()
	async InitUserWearables(forceRefresh: boolean = false): Promise<void> {
		if (this.isWearableDataLoaded && !forceRefresh) return

		try {
			this.userData = await LoadUserData()

			// Check if we got user data with wearables
			if (!this.userData?.wearables?.length) {
				console.log("OutfitManager: InitUserWearables: No wearables available after retries")
				return
			}

			// Fetch wearable data for each URN
			this.playerWearables = []
			const wearableUrns = this.userData.wearables
			
			for (const urn of wearableUrns) {
				const data = await GetWearableData(urn)
				this.playerWearables.push(data)
				//console.log("OutfitManager: InitUserWearables: got wearable data for", urn, ": ", JSON.stringify(data))
			}

			// Update other avatar properties
			//this.npcBodyShape = this.userData.avatar?.bodyShapeUrn || "urn:decentraland:off-chain:base-avatars:BaseMale"
			//this.npcHairColor = this.userData.avatar?.hairColor || Color3.create(0.5, 0.5, 0.5)
			//this.npcOutfit.wearables = this.playerWearables.map(w => ({ ...w }))

			this.npcOutfit = {
				userId   : this.userData.userId,
				wearables: this.playerWearables.map(w => w),
				bodyShape: this.userData.avatar?.bodyShapeUrn || "urn:decentraland:off-chain:base-avatars:BaseMale",
				hairColor: this.userData.avatar?.hairColor || Color3.create(0.5, 0.5, 0.5),
				skinColor: this.userData.avatar?.skinColor || Color3.create(0.5, 0.5, 0.5)
			}
			this.isWearableDataLoaded = true

			console.log(
				"OutfitManager InitUserWearables: got",
				this.playerWearables.length,
				"wearables for the player"
			)
		} catch (err) {
			console.error("OutfitManager InitUserWearables: failed to load wearables", err)
		}
	}

	// MARK: Update
	System_UpdateMannequin = (dt: number) => {
		if (!this.runUpdate) return
		if (!this.npcMannequin) return
		if (!this.npcPodium) return
		if (!this.npcBtnReset) return
		if (!this.npcBtnCopy) return
		if (!this.npcBtnSwap) return

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
			if (!this.runUpdate) return
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

		rotateButtonToFaceCamera(this.npcBtnReset)
		rotateButtonToFaceCamera(this.npcBtnCopy)
		rotateButtonToFaceCamera(this.npcBtnSwap)
	}




	// MARK: Show NPC Mannequin
	ShowNPCMannequin() {
		
		this.runUpdate = false

		const position = Vector3.create(1.5, 0.25, 0)
		
		// Create the podium
		if (!this.npcPodium) {
			this.npcPodium = engine.addEntity()
			Transform.createOrReplace(this.npcPodium, {
				position: position,
				rotation: Quaternion.fromEulerDegrees(0, 0, 0),
				scale   : Vector3.create(1, 1, 1),
				parent  : engine.PlayerEntity,
			})
			GltfContainer.createOrReplace(this.npcPodium, {
				src: "assets/models/podiumnocollider.gltf",
			})
		}

		// Create the reset button
		if (!this.npcBtnReset) {
			this.npcBtnReset = engine.addEntity()
			Transform.create(this.npcBtnReset, {
				parent  : this.npcPodium,
			})
			GltfContainer.create(this.npcBtnReset, {
				src: "assets/models/btnReset.gltf",
			})
			pointerEventsSystem.onPointerDown(
				{ 
					entity: this.npcBtnReset, 
					opts: { 
						button: InputAction.IA_POINTER,
						hoverText: "Reset all wearables",
						maxDistance: 4,
					}
				}, 
				() => { this.ResetOutfit() }
			)
		}

		// Create the copy outfit button
		if (!this.npcBtnCopy) {
			this.npcBtnCopy = engine.addEntity()
			Transform.create(this.npcBtnCopy, {
				parent  : this.npcPodium,
			})
			GltfContainer.create(this.npcBtnCopy, {
				src: "assets/models/btnCopy.gltf",
			})
			pointerEventsSystem.onPointerDown(
				{ 
					entity: this.npcBtnCopy, 
					opts: { 
						button: InputAction.IA_POINTER,
						hoverText: "Copy my wearables",
						maxDistance: 4,
					}
				}, 
				() => { this.CopyMyOutfit() }
			)
		}

		// Create the swap gender
		if (!this.npcBtnSwap) {
			this.npcBtnSwap = engine.addEntity()
			Transform.create(this.npcBtnSwap, {
				parent  : this.npcPodium,
			})
			GltfContainer.create(this.npcBtnSwap, {
				src: "assets/models/btnGenderSwap.gltf",
			})
			pointerEventsSystem.onPointerDown(
				{ 
					entity: this.npcBtnSwap, 
					opts: { 
						button: InputAction.IA_POINTER,
						hoverText: "Swap gender",
						maxDistance: 4,
					}
				}, 
				() => { this.SwapGender() }
			)
		}

		// Create the mannequin
		if (!this.npcMannequin) {
			this.npcMannequin = engine.addEntity()

			Transform.create(this.npcMannequin, {
				parent: this.npcPodium,
			})
		}

		AvatarShape.createOrReplace(this.npcMannequin, {
			id       : "npc_mannequin    ",
			name     : "",
			bodyShape: this.npcOutfit?.bodyShape,
			wearables: this.npcOutfit?.wearables?.map(w => w.urn) ?? [],
			emotes   : [],
			hairColor: this.npcOutfit.hairColor,
			skinColor: this.npcOutfit.skinColor,
		})
	
		// Attempt to stop walking animation on character but doesn't work
/* 		Animator.createOrReplace(this.npcMannequin, {
			states: [
			  {
				clip: 'idle',
				playing: true,
				loop: true
			  }
			]
		}) */
		this.runUpdate = true

	}

	// MARK: Hide NPC Mannequin
	HideNPCMannequin() {
		this.runUpdate = false
		if (this.npcMannequin) {
			engine.removeEntity(this.npcMannequin)
			this.npcMannequin = undefined
		}
		if (this.npcBtnReset) {
			engine.removeEntity(this.npcBtnReset)
			this.npcBtnReset = undefined
		}
		if (this.npcBtnCopy) {
			engine.removeEntity(this.npcBtnCopy)
			this.npcBtnCopy = undefined
		}
		if (this.npcBtnSwap) {
			engine.removeEntity(this.npcBtnSwap)
			this.npcBtnSwap = undefined
		}
		if (this.npcPodium) {
			engine.removeEntity(this.npcPodium)
			this.npcPodium = undefined
		}
	}

	// MARK: Button funcs


	ResetOutfit() {
		console.log("OutfitManager ResetOutfit")
		this.npcOutfit.wearables = []
		//this.HideNPCMannequin()
		this.ShowNPCMannequin()
	}

	CopyMyOutfit() {
		console.log("OutfitManager CopyMyOutfit")
		this.npcOutfit.wearables = this.playerWearables?.map(w => w) ?? []
		//this.HideNPCMannequin()
		this.ShowNPCMannequin()
	}

	SwapGender() {
		console.log("OutfitManager SwapGender")
		// if the current this.npcBodyShape contains "Female" then set it to "BaseMale"
		// otherwise set it to "BaseFemale"
		if (this.npcOutfit?.bodyShape?.includes("Female")) {
			this.npcOutfit.bodyShape = "urn:decentraland:off-chain:base-avatars:BaseMale"
		} else {
			this.npcOutfit.bodyShape = "urn:decentraland:off-chain:base-avatars:BaseFemale"
		}

		this.runUpdate = false
		this.ShowNPCMannequin()

	}


	// MARK: Util

	GetCurrentOutfit(): Outfit {
		return this.npcOutfit
	}
/* 	GetCurrentWearables(): Wearable[] {
		return this.npcOutfit.wearables?.map(w => w) ?? []
	}
	GetCurrentBodyShape(): string {
		return this.npcBodyShape ?? "urn:decentraland:off-chain:base-avatars:BaseMale"
	}
	GetCurrentHairColor(): Color3 {
		return this.npcHairColor ?? Color3.create(0.5, 0.5, 0.5)
	} */

	// MARK: Equip Wearable
	async EquipWearable(wearable: Wearable) {
		console.log("OutfitManager EquipWearable: equipping wearable", wearable.name, wearable.category)

		// Make sure the mannequin exists
		if (!this.npcMannequin) {
			console.error("OutfitManager EquipWearable: npc mannequin not found")
			return
		}

		// Make sure the npc wearables exist
		if (!this.npcOutfit.wearables) {
			console.error("OutfitManager EquipWearable: npcOutfit.wearables not found")
			return
		}

		// Remove any existing wearables in the same category
		for (const currentWearable of this.npcOutfit.wearables) {
			if (currentWearable.category === wearable.category) {
				this.npcOutfit.wearables.splice(this.npcOutfit.wearables.indexOf(currentWearable), 1)
				break
			}
		}

		// Add the new wearable to the npc wearables
		this.npcOutfit.wearables.push(wearable)

		// Update the mannequin with the new wearables
		this.ShowNPCMannequin()

		// Let the host know about the new outfit
		sceneMessageBus.emit(MessageBusEvents.NOTIFY_SERVER_OUTFIT, this.npcOutfit)
	}

	// MARK: Set Hair Color
	SetHairColor(color: Color3) {
		console.log("OutfitManager SetHairColor: setting hair color to", color)
		this.npcOutfit.hairColor = color
		this.ShowNPCMannequin()
	}

	// MARK: Set Skin Color
	SetSkinColor(color: Color3) {
		console.log("OutfitManager SetSkinColor:", Color3.toHexString(color))
		this.npcOutfit.skinColor = color
		this.ShowNPCMannequin()
	}
}

export const _OutfitManager = new OutfitManager();