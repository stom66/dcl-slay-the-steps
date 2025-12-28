import { AvatarShape, ColliderLayer, EasingFunction, engine, Entity, GltfContainer, InputAction, MeshCollider, pointerEventsSystem, Transform, TriggerArea, triggerAreaEventsSystem } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

import * as utils from '@dcl-sdk/utils'

import { ShopSlot, Wearable } from "./shopSlotData"
import { _OutfitManager } from "./OutfitManager"
import { ShopZone, shopZones } from "./shopZoneData"
import { blockedCreatorAddresses, blockedItemURNs, blockedKeywords } from "./shopBlockedItems"
import { FetchZoneItems } from "./utils"

/**
 * Manages shop zones, their items, and UI interactions.
 * Each zone can display items from the API and allow users to browse through pages.
 */
class ShopManager {
	// Zone state: maps zone key to array of spawned item entities
	private zoneItems: Record<string, Entity[]> = {}
	
	// UI entities: maps zone key to UI root entity
	private zoneUIs: Record<string, Entity> = {}
	
	// Navigation state: maps zone key to current page number
	private zonePages: Record<string, number> = {}
	
	// Trigger zone entities: maps zone key to trigger entity
	private triggerZones: Record<string, Entity> = {}

	constructor() {
		console.log("ShopManager constructor")
	}

	init() {
		console.log("ShopManager init")
		this.initializeZones()
		this.createTriggerZones()
		this.createShopUIs()
		this.SpawnAllZoneItems()
	}

	// MARK: - Zone Initialization
	
	/**
	 * Initialize all zones with empty item arrays and page 0
	 */
	private initializeZones() {
		shopZones.forEach((zone) => {
			this.zoneItems[zone.key] = []
			this.zonePages[zone.key] = 0
		})
	}

	// MARK: - Trigger Zones
	
	/**
	 * Create trigger zones that detect when players enter/exit shop areas
	 */
	private createTriggerZones() {
		console.log("ShopManager: Creating trigger zones")
		shopZones.forEach((zone) => {
			const triggerEntity = engine.addEntity()
			Transform.create(triggerEntity, {
				position: zone.position,
				scale   : zone.scale || Vector3.One()
			})
			TriggerArea.setSphere(triggerEntity)
			
			this.triggerZones[zone.key] = triggerEntity
			
			triggerAreaEventsSystem.onTriggerEnter(triggerEntity, (result) => {
				if (result.trigger?.entity !== engine.PlayerEntity) return
				console.log(`ShopManager: Player entered zone "${zone.key}"`)
				//this.showUI(zone)
				_OutfitManager.ShowNPCMannequin()
			})
			
			triggerAreaEventsSystem.onTriggerExit(triggerEntity, (result) => {
				if (result.trigger?.entity !== engine.PlayerEntity) return
				console.log(`ShopManager: Player exited zone "${zone.key}"`)
				//this.hideUI(zone)
				_OutfitManager.HideNPCMannequin()
			})
		})
	}

	// MARK: - UI Management
	
	/**
	 * Create UI panels for each shop zone with navigation buttons
	 */
	private createShopUIs() {
		console.log("ShopManager: Creating shop UIs")
		shopZones.forEach((zone) => {
			// Root sign entity
			const signEntity = engine.addEntity()
			Transform.create(signEntity, {
				position: zone.uiOffset,
				rotation: zone.uiRotation,
				scale   : Vector3.One()
			})
			GltfContainer.create(signEntity, {
				src: 'assets/models/shopZoneSign.gltf'
			})

			// Sign text label
			const signTextEntity = engine.addEntity()
			Transform.create(signTextEntity, {
				parent: signEntity
			})
			GltfContainer.create(signTextEntity, {
				src: `assets/models/shopZone.${zone.key}.gltf`
			})

			// Previous page button
			const btnLeftEntity = engine.addEntity()
			Transform.create(btnLeftEntity, {
				parent: signEntity
			})
			GltfContainer.create(btnLeftEntity, {
				src: 'assets/models/shopZoneSignBtnLeft.gltf'
			})
			pointerEventsSystem.onPointerDown(
				{ 
					entity: btnLeftEntity, 
					opts: { 
						button: InputAction.IA_POINTER,
						hoverText: "Previous",
						maxDistance: 20
					} 
				},
				() => {
					this.previousPage(zone)
				}
			)

			// Next page button
			const btnRightEntity = engine.addEntity()
			Transform.create(btnRightEntity, {
				parent: signEntity
			})
			GltfContainer.create(btnRightEntity, {
				src: 'assets/models/shopZoneSignBtnRight.gltf'
			})
			pointerEventsSystem.onPointerDown(
				{ 
					entity: btnRightEntity, 
					opts: { 
						button: InputAction.IA_POINTER,
						hoverText: "Next",
						maxDistance: 20
					} 
				},
				() => {
					this.nextPage(zone)
				}
			)

			// Store the root UI entity (sign) for visibility control
			this.zoneUIs[zone.key] = signEntity
		})
	}

	private createHairColorWheel() {
		const hairColorWheelEntity = engine.addEntity()
	}
	/**
	 * Show the UI for a specific zone
	 */
	private showUI(zone: ShopZone) {
		const uiEntity = this.zoneUIs[zone.key]
		if (!uiEntity) {
			console.error(`ShopManager: No UI entity found for zone "${zone.key}"`)
			return
		}
		
		// Make UI visible by ensuring it has a transform
		const transform = Transform.getMutable(uiEntity)
		if (transform) {
			transform.scale = Vector3.One()
		}
		console.log(`ShopManager: Showing UI for zone "${zone.key}"`)
	}

	/**
	 * Hide the UI for a specific zone
	 */
	private hideUI(zone: ShopZone) {
		const uiEntity = this.zoneUIs[zone.key]
		if (!uiEntity) {
			console.error(`ShopManager: No UI entity found for zone "${zone.key}"`)
			return
		}
		
		// Hide UI by scaling to zero
		const transform = Transform.getMutable(uiEntity)
		if (transform) {
			transform.scale = Vector3.Zero()
		}
		console.log(`ShopManager: Hiding UI for zone "${zone.key}"`)
	}

	// MARK: - Navigation
	
	/**
	 * Navigate to the next page of items for a zone
	 */
	private nextPage(zone: ShopZone) {
		console.log(`ShopManager: NextPage: showing page ${zone.currentPage + 1} for zone "${zone.key}"`)
		zone.currentPage++
		this.updateZoneItems(zone)
	}

	/**
	 * Navigate to the previous page of items for a zone
	 */
	private previousPage(zone: ShopZone) {
		console.log(`ShopManager: Previous: showing page ${zone.currentPage -1} for zone "${zone.key}"`)
		if (zone.currentPage > -1) {
			zone.currentPage--
			this.updateZoneItems(zone)
		}
	}

	// MARK: - Item Management
	
	/**
	 * Update items in a zone by fetching new items from the API
	 */
	private async updateZoneItems(zone: ShopZone) {
		console.log(`ShopManager: updateZoneItems: fetching items for zone "${zone.key}"`)
		if (zone.currentPage == -1) {
			this.ResetZoneToDefault(zone)
		} else {
			await FetchZoneItems(zone)
		}
		this.SpawnZoneItems(zone)
	}

	private ResetZoneToDefault(zone: ShopZone) {
		for (const slot of zone.slots) {
			slot.currentWearable = undefined
		}
	}

	/**
	 * Remove all items from a zone
	 */
	private removeZoneItems(zone: ShopZone) {
		console.log(`ShopManager: removeZoneItems: removing items for zone "${zone.key}"`)
		// Create a copy of the entities array and clear it immediately
		// This prevents issues when new items are spawned before old ones are fully removed
		const entitiesToRemove = [...zone.entities]
		zone.entities.length = 0
		
		let counter = 0
		entitiesToRemove.forEach((entity) => {
			const transform = Transform.get(entity)
			utils.tweens.startScaling(entity, transform.scale, Vector3.Zero(), 0.5, utils.InterpolationType.EASEINEXPO)
			utils.timers.setTimeout(() => { engine.removeEntity(entity) }, 500)
			counter++
		})
		console.log(`ShopManager: Removed ${counter} items from zone "${zone.key}"`)
	}

	/**
	 * Spawn default items for all zones using their default URNs
	 */
	private SpawnAllZoneItems() {
		console.log("ShopManager: Spawning default items for all zones")
		
		shopZones.forEach((zone: ShopZone) => {
			this.SpawnZoneItems(zone)
		})
	}

	private SpawnZoneItems(zone: ShopZone) {
		this.removeZoneItems(zone)
		zone.slots.forEach((slot) => {
			//slot.currentWearable = undefined
			zone.entities.push(this.spawnItem(slot))
		})
		console.log(`ShopManager: Spawned ${zone.slots.length} default items for zone "${zone.key}"`)
	}

	//MARK: spawnItem
	/**
	 * Spawn a single item entity at a slot location
	 */
	private spawnItem(slot: ShopSlot): Entity {
		const entity = engine.addEntity()

		const blockedItem = isBlockedItem(slot.currentWearable ?? slot.defaultWearable)

		Transform.create(entity, {
			position: slot.position || Vector3.Zero(),
			rotation: slot.rotation || Quaternion.Identity(),
			scale   : Vector3.Zero()
		})

		const wearable = slot.currentWearable ?? slot.defaultWearable

		if (blockedItem) {
			// Add a gltf model showing an error 
			GltfContainer.create(entity, {
				src: `assets/models/error.${wearable.category}.gltf`,
				invisibleMeshesCollisionMask: ColliderLayer.CL_POINTER
			})
		} 
		else {
			// Add a custom collider to ensure pointer works
			GltfContainer.create(entity, {
				src: `assets/models/avatarCollider.${wearable.category}.gltf`,
				invisibleMeshesCollisionMask: ColliderLayer.CL_POINTER
			})

			const bodyShape = "urn:decentraland:off-chain:base-avatars:" + (wearable.bodyShapes?.[0] || "BaseMale")

			AvatarShape.create(entity, {
				id               : '    ',
				emotes           : [],
				bodyShape        : bodyShape,
				wearables        : [wearable.urn],
				showOnlyWearables: slot.showAvatar ? false : true,
				eyeColor         : slot.eyeColor || undefined,
				skinColor        : slot.skinColor || undefined,
				hairColor        : slot.hairColor || undefined
			})
		}
		
		utils.timers.setTimeout(() => {
			utils.tweens.startScaling(entity, Vector3.Zero(),  slot.scale || Vector3.One(), 0.5, utils.InterpolationType.EASEOUTEXPO)
		}, 500)

		let hoverText = "Equip " + wearable.name
		if (wearable.bodyShapes?.length && wearable.bodyShapes.length < 2) {
			hoverText += wearable.bodyShapes[0] == "BaseMale" ? "\n(Male only)" : "\n(Female only)"
		}
		hoverText = blockedItem ? "Couldn't load item" : hoverText

		pointerEventsSystem.onPointerDown(
			{ 
				entity: entity, 
				opts: { 
					button     : InputAction.IA_POINTER,
					hoverText  : hoverText,
					maxDistance: 10
				} 
			},
			() => {
				if (blockedItem) return
				console.log("ShopManager: Equip urn: " + wearable.urn)
				_OutfitManager.EquipWearable(wearable)
			}
		)

		return entity
	}
}

export const _ShopManager = new ShopManager()



function isBlockedItem(item: Wearable) {
	// if the urn is in the blockedItemURNs array, return true
	if (blockedItemURNs.includes(item.urn)) {
		return true
	}

	if (item.creator) {	
		if (blockedCreatorAddresses.includes(item.creator)) {
			return true
		}
	}

	// Check both the item name, and the item urn for any blocked keywords
	// If any of the keywords are found, return true
	
	if (blockedKeywords.some(keyword => item.name?.toLowerCase().includes(keyword.toLowerCase()))) {
		return true
	}

	if (blockedKeywords.some(keyword => item.urn?.toLowerCase().includes(keyword.toLowerCase()))) {
		return true
	}

	if (blockedKeywords.some(keyword => item.description?.toLowerCase().includes(keyword.toLowerCase()))) {
		return true
	}

	return false
}