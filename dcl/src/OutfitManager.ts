import { getPlayer } from "@dcl/sdk/players"
import * as utils from '@dcl-sdk/utils'
import { Animator, AvatarEquippedData, AvatarShape, engine, Entity, GltfContainer, InputAction, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { Wearable } from "./shopSlotData"
import { GetWearableData, LoadUserData } from "./utils"
import { MessageBus } from "@dcl/sdk/message-bus"

const sceneMessageBus = new MessageBus()

export type Outfit = {
	userId: string,
	outfit: string[],
}


class OutfitManager {
	
	userData            : undefined | any        = undefined
	npcMannequin        : undefined | Entity     = undefined
	npcPodium           : undefined | Entity     = undefined
	npcBtnReset         : undefined | Entity     = undefined
	npcBtnCopy          : undefined | Entity     = undefined
	npcWearables        : undefined | Wearable[] = undefined // What their mannequin is wearing (starts off same as player)
	playerWearables     : undefined | Wearable[] = undefined // What the player is currently wearing
	isWearableDataLoaded: boolean                = false
	wearableDataCache   : Map<string, Wearable>  = new Map()
	runUpdate           : boolean                = false
	constructor() { }

	init() {
		console.log("OutfitManager init")	
		this.InitUserWearables()

		AvatarEquippedData.onChange(engine.PlayerEntity, (equipped) => {
			if (!equipped) return
			this.InitUserWearables(true)
		})

		engine.addSystem(this.update)
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
			const wearables: Wearable[] = []
			const wearableUrns = this.userData.wearables
			
			for (const urn of wearableUrns) {
				const data = await GetWearableData(urn)
				wearables.push(data)
				console.log("OutfitManager: InitUserWearables: got wearable data for", urn, ": ", JSON.stringify(data))
			}

			// Update singleton state
			this.playerWearables = wearables
			this.npcWearables = wearables.map(w => ({ ...w }))
			this.isWearableDataLoaded = true

			console.log(
				"OutfitManager InitUserWearables: got",
				wearables.length,
				"wearables for the player"
			)
		} catch (err) {
			console.error("OutfitManager InitUserWearables: failed to load wearables", err)
		}
	}


	update = (dt: number) => {
		if (!this.runUpdate) return
		if (!this.npcMannequin) return
		if (!this.npcPodium) return
		if (!this.npcBtnReset) return
		if (!this.npcBtnCopy) return

		// Get camera position (what the player sees)
		const cameraTransform = Transform.get(engine.CameraEntity)
		const cameraPosition = cameraTransform.position

		// Get player world rotation (buttons are parented to player, so we need to account for this)
		const playerWorldRotation = utils.getWorldRotation(engine.PlayerEntity)

		// Helper function to get inverse quaternion (for unit quaternions, inverse = conjugate)
		const quaternionInverse = (q: Quaternion): Quaternion => {
			return Quaternion.create(-q.x, -q.y, -q.z, q.w)
		}

		// Rotate buttons to face the camera
		const rotateButtonToFaceCamera = (buttonEntity: Entity) => {
			const buttonWorldPos     = utils.getWorldPosition(buttonEntity)
			const direction          = Vector3.subtract(cameraPosition, buttonWorldPos)
			const normalized         = Vector3.normalize(direction)
			const worldLookRotation  = Quaternion.lookRotation(normalized)
			
			// Convert world rotation to local rotation (relative to player)
			// localRotation = inverse(playerWorldRotation) * worldRotation
			const playerRotationInverse = quaternionInverse(playerWorldRotation)
			const localRotation = Quaternion.multiply(playerRotationInverse, worldLookRotation)
			
			const buttonTransform    = Transform.getMutable(buttonEntity)
			buttonTransform.rotation = localRotation
		}

		rotateButtonToFaceCamera(this.npcBtnReset)
		rotateButtonToFaceCamera(this.npcBtnCopy)
	}




	// MARK: Show/Hide NPC Mannequin
	ShowNPCMannequin() {
		if (this.npcMannequin) engine.removeEntity(this.npcMannequin)
		if (this.npcPodium) engine.removeEntity(this.npcPodium)

		const position = Vector3.create(1.5, 0.25, 0)
		
		// Create the podium
		this.npcPodium = engine.addEntity()
		Transform.create(this.npcPodium, {
			position: position,
			rotation: Quaternion.fromEulerDegrees(0, 0, 0),
			scale   : Vector3.create(1, 1, 1),
			parent  : engine.PlayerEntity,
		})
		GltfContainer.create(this.npcPodium, {
			src: "assets/models/podium.gltf",
		})

		// Create the reset button
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
					button: InputAction.IA_PRIMARY,
					hoverText: "Reset Outfit",
					maxDistance: 4,
				}
			}, 
			() => { this.ResetOutfit() }
		)

		// Create the copy outfit button
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
					button: InputAction.IA_PRIMARY,
					hoverText: "Copy my outfit",
					maxDistance: 4,
				}
			}, 
			() => { this.CopyMyOutfit() }
		)

		// Create the mannequin
		this.npcMannequin = engine.addEntity()
		AvatarShape.create(this.npcMannequin, {
			id       : "npc_mannequin    ",
			name     : "",
			bodyShape: "urn:decentraland:off-chain:base-avatars:BaseMale",
			wearables: this.npcWearables?.map(w => w.urn) ?? [],
			emotes   : [],
		})
		Transform.create(this.npcMannequin, {
			parent: this.npcPodium,
		})
		
		Animator.create(this.npcMannequin, {
			states: [
			  {
				clip: 'idle',
				playing: true,
				loop: true
			  }
			]
		  })
		  this.runUpdate = true

	}

	HideNPCMannequin() {
		this.runUpdate = false
		if (this.npcMannequin) engine.removeEntity(this.npcMannequin)
		if (this.npcPodium) engine.removeEntity(this.npcPodium)
		if (this.npcBtnReset) engine.removeEntity(this.npcBtnReset)
		if (this.npcBtnCopy) engine.removeEntity(this.npcBtnCopy)
	}

	GetCurrentOutfit(): string[] {
		return this.npcWearables?.map(w => w.urn) ?? []
	}

	ResetOutfit() {
		console.log("OutfitManager ResetOutfit")
		this.npcWearables = []
		this.HideNPCMannequin()
		this.ShowNPCMannequin()
	}

	CopyMyOutfit() {
		console.log("OutfitManager CopyMyOutfit")
		this.npcWearables = this.playerWearables?.map(w => ({ ...w })) ?? []
		this.HideNPCMannequin()
		this.ShowNPCMannequin()
	}


	// MARK: Equip Wearable
	async EquipWearable(wearable: Wearable) {
		console.log("OutfitManager EquipWearable: equipping wearable", wearable.name, wearable.category)

		// Make sure the mannequin exists
		if (!this.npcMannequin) {
			console.error("OutfitManager EquipWearable: npc mannequin not found")
			return
		}

		// Make sure the npc wearables exist
		if (!this.npcWearables) {
			console.error("OutfitManager EquipWearable: npc wearables not found")
			return
		}

		// Remove any existing wearables in the same category
		for (const currentWearable of this.npcWearables) {
			if (currentWearable.category === wearable.category) {
				this.npcWearables.splice(this.npcWearables.indexOf(currentWearable), 1)
				break
			}
		}

		// Add the new wearable to the npc wearables
		this.npcWearables.push(wearable)

		// Let the host know about the new outfit
		sceneMessageBus.emit('outfitUpdate', {
			userId: this.userData?.userId ?? "",
			outfit: this.npcWearables.map(w => w.urn)
		})

		// Update the mannequin with the new wearables
		this.HideNPCMannequin()
		this.ShowNPCMannequin()
	}
}

export const _OutfitManager = new OutfitManager();