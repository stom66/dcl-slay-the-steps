import { AvatarShape, EasingFunction, engine, Entity, GltfContainer, InputAction, MeshCollider, pointerEventsSystem, Transform, TriggerArea, triggerAreaEventsSystem } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

import * as utils from '@dcl-sdk/utils'

import { ShopSlot, shopZones } from "./shopData"

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
		this.spawnDefaultItems()
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
				//this.showUI(zone.key)
			})
			
			triggerAreaEventsSystem.onTriggerExit(triggerEntity, (result) => {
				if (result.trigger?.entity !== engine.PlayerEntity) return
				console.log(`ShopManager: Player exited zone "${zone.key}"`)
				//this.hideUI(zone.key)
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
						button: InputAction.IA_PRIMARY,
						hoverText: "Previous",
						maxDistance: 20
					} 
				},
				() => {
					console.log(`ShopManager: Previous page for zone "${zone.key}"`)
					this.previousPage(zone.key)
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
						button: InputAction.IA_PRIMARY,
						hoverText: "Next",
						maxDistance: 20
					} 
				},
				() => {
					console.log(`ShopManager: Next page for zone "${zone.key}"`)
					this.nextPage(zone.key)
				}
			)

			// Store the root UI entity (sign) for visibility control
			this.zoneUIs[zone.key] = signEntity
		})
	}

	/**
	 * Show the UI for a specific zone
	 */
	private showUI(zoneKey: string) {
		const uiEntity = this.zoneUIs[zoneKey]
		if (!uiEntity) {
			console.error(`ShopManager: No UI entity found for zone "${zoneKey}"`)
			return
		}
		
		// Make UI visible by ensuring it has a transform
		const transform = Transform.getMutable(uiEntity)
		if (transform) {
			transform.scale = Vector3.One()
		}
		console.log(`ShopManager: Showing UI for zone "${zoneKey}"`)
	}

	/**
	 * Hide the UI for a specific zone
	 */
	private hideUI(zoneKey: string) {
		const uiEntity = this.zoneUIs[zoneKey]
		if (!uiEntity) {
			console.error(`ShopManager: No UI entity found for zone "${zoneKey}"`)
			return
		}
		
		// Hide UI by scaling to zero
		const transform = Transform.getMutable(uiEntity)
		if (transform) {
			transform.scale = Vector3.Zero()
		}
		console.log(`ShopManager: Hiding UI for zone "${zoneKey}"`)
	}

	// MARK: - Navigation
	
	/**
	 * Navigate to the next page of items for a zone
	 */
	private nextPage(zoneKey: string) {
		this.zonePages[zoneKey]++
		this.updateZoneItems(zoneKey)
	}

	/**
	 * Navigate to the previous page of items for a zone
	 */
	private previousPage(zoneKey: string) {
		if (this.zonePages[zoneKey] > 0) {
			this.zonePages[zoneKey]--
			this.updateZoneItems(zoneKey)
		}
	}

	// MARK: - Item Management
	
	/**
	 * Update items in a zone by fetching new items from the API
	 */
	private async updateZoneItems(zoneKey: string) {
		const zone = shopZones.find((z) => z.key === zoneKey)
		if (!zone) {
			console.error(`ShopManager: Couldn't find zone for key "${zoneKey}"`)
			return
		}

		// Fetch new items from API
		const url = this.buildAPIUrl(zoneKey)
		if (!url) {
			console.error(`ShopManager: Couldn't build API URL for zone "${zoneKey}"`)
			return
		}

		try {
			const response = await fetch(url)
			const data = await response.json()
			console.log(`ShopManager: Fetched ${data.data?.length || 0} items from API for zone "${zoneKey}"`)

			// Remove existing items
			this.removeZoneItems(zoneKey)

			// Spawn new items
			if (data.data && Array.isArray(data.data)) {
				for (const [index, apiItem] of data.data.entries()) {
					const slot = zone.slots[index]
					if (!slot) {
						console.log(`ShopManager: No slot found at index ${index} for zone "${zoneKey}"`)
						continue
					}

					const isMale = apiItem.data?.wearable?.bodyShapes?.[0] == 'BaseMale'
					const itemEntity = this.spawnItem(slot, apiItem.urn, isMale)
					this.zoneItems[zoneKey].push(itemEntity)
				}
			}
		} catch (error) {
			console.error(`ShopManager: Failed to update items for zone "${zoneKey}":`, error)
		}
	}

	/**
	 * Remove all items from a zone
	 */
	private removeZoneItems(zoneKey: string) {
		const items = this.zoneItems[zoneKey] || []
		items.forEach((entity) => {
			const transform = Transform.get(entity)
			utils.tweens.startScaling(entity, transform.scale, Vector3.Zero(), 0.5, utils.InterpolationType.EASEINEXPO)
			utils.timers.setTimeout(() => { engine.removeEntity(entity) }, 500)
		})
		this.zoneItems[zoneKey] = []
		console.log(`ShopManager: Removed ${items.length} items from zone "${zoneKey}"`)
	}

	/**
	 * Spawn default items for all zones using their default URNs
	 */
	private spawnDefaultItems() {
		console.log("ShopManager: Spawning default items for all zones")
		
		shopZones.forEach((zone) => {
			zone.slots.forEach((slot) => {
				const itemEntity = this.spawnItem(slot, slot.defaultUrn)
				this.zoneItems[zone.key].push(itemEntity)
			})
			console.log(`ShopManager: Spawned ${zone.slots.length} default items for zone "${zone.key}"`)
		})
	}

	//MARK: spawnItem
	/**
	 * Spawn a single item entity at a slot location
	 */
	private spawnItem(
		slot   : ShopSlot, 
		urn?   : string, 
		isMale?: boolean
	): Entity {
		const entity = engine.addEntity()

		Transform.create(entity, {
			position: slot.position || Vector3.Zero(),
			rotation: slot.rotation || Quaternion.Identity(),
			scale   : Vector3.Zero()
		})

		AvatarShape.create(entity, {
			id               : '',
			emotes           : [],
			bodyShape        : (typeof isMale === 'boolean' ? isMale : slot.isMale)
				? 'urn:decentraland:off-chain:base-avatars:BaseMale' 
				: 'urn:decentraland:off-chain:base-avatars:BaseFemale',
			wearables        : [urn ?? slot.currentUrn ?? slot.defaultUrn ?? ''],
			showOnlyWearables: slot.showAvatar ? false : true,
			eyeColor         : slot.eyeColor || undefined,
			skinColor        : slot.skinColor || undefined,
			hairColor        : slot.hairColor || undefined
		})
		
		utils.timers.setTimeout(() => {
			utils.tweens.startScaling(entity, Vector3.Zero(),  slot.scale || Vector3.One(), 0.5, utils.InterpolationType.EASEOUTEXPO)
		}, 500)

		MeshCollider.setBox(entity)

		pointerEventsSystem.onPointerDown(
			{ 
				entity: entity, 
				opts: { 
					button: InputAction.IA_PRIMARY,
					hoverText: "Equip Item: " + urn,
					maxDistance: 20
				} 
			},
			() => {
				console.log("ShopManager: Equip item" + urn)
			}
		)

		return entity
	}


	// MARK: - API Integration
	
	/**
	 * Build the API URL for fetching items for a specific zone
	 */
	private buildAPIUrl(zoneKey: string): string | null {
		const zone = shopZones.find((z) => z.key === zoneKey)
		if (!zone) {
			console.error(`ShopManager: Couldn't find zone for key "${zoneKey}"`)
			return null
		}

		const pageSize = zone.slots.length || 1
		const skip = (this.zonePages[zoneKey] || 0) * pageSize
		
		// Build URL parameters manually (URLSearchParams may not be available)
		const params: string[] = []
		params.push(`skip=${skip}`)
		params.push(`first=${pageSize}`) // API uses 'first' instead of 'limit'
		params.push(`itemType=wearable`)
		
		// Handle category filtering
		if (zone.wearableCategory) {
			if (typeof zone.wearableCategory === 'string') {
				params.push(`wearableCategory=${zone.wearableCategory}`)
			} else if (Array.isArray(zone.wearableCategory)) {
				zone.wearableCategory.forEach(category => {
					params.push(`wearableCategory=${category}`)
				})
			}
		}

		const url = `https://marketplace-api.decentraland.org/v1/items?${params.join('&')}`
		console.log(`ShopManager: Built API URL for zone "${zoneKey}": ${url}`)
		return url
	}
}

export const _ShopManager = new ShopManager()
