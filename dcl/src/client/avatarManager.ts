import * as utils from "@dcl-sdk/utils"
import { AvatarShape, Entity, PBAvatarShape } from "@dcl/sdk/ecs"
import { Color3 } from "@dcl/sdk/math"




type SpawnQueueItem = {
	parent    : Entity,
	priority  : number,
	properties: PBAvatarShape,
	callback  : () => void | undefined
}

class AvatarManager {
	spawnQueue   : SpawnQueueItem[]
	lastSpawnTime: number
	processQueue : boolean

	spawnInterval: number = 1 * 200 // 200ms

	constructor() {
		this.spawnQueue    = []
		this.lastSpawnTime = 0
		this.processQueue  = false
	}

	SpawnAvatar(
		parent    : Entity, 
		properties: PBAvatarShape,
		priority  : number = 50,
		callback  : () => void = () => {}
	) {
		console.log(`AvatarManager: SpawnAvatar: Spawning avatar for parent ${parent} with properties ${JSON.stringify(properties)}`)
		console.log(`AvatarManager: SpawnAvatar: Queue length: ${this.spawnQueue.length}`)
		// Store the item in the queue
		const queueItem: SpawnQueueItem = { 
			parent    : parent, 
			priority  : priority,
			properties: properties,
			callback  : callback
		}
		this.spawnQueue.push(queueItem)

		// Process the queue if it's not already processing
		if (!this.processQueue) {
			this.processQueue = true
			this.ProcessQueue()
		}

		// return the ID, so the caller can use it to remove the avatar
	}
	
	ProcessQueue() {
		// Ensure minimum time has passed
		const now = Date.now()
		const timeSinceLastSpawn = now - this.lastSpawnTime
		if (timeSinceLastSpawn < this.spawnInterval) {
			console.log(`AvatarManager: ProcessQueue: Minimum time not passed, skipping`)
			utils.timers.setTimeout(() => {
				this.ProcessQueue()
			}, this.spawnInterval - timeSinceLastSpawn)

			return
		}

		// Sort the queue by priority
		this.spawnQueue = this.spawnQueue.sort((a: SpawnQueueItem, b: SpawnQueueItem): number => b.priority - a.priority)

		// pop first item from queue
		const item: SpawnQueueItem | undefined = this.spawnQueue.shift()
		if (!item) {
			this.processQueue = false
			return
		}

		try {
			AvatarShape.createOrReplace(item.parent, {
				id       : item.properties.id,
				name     : item.properties.name,
				bodyShape: item.properties.bodyShape,
				wearables: item.properties.wearables,
				emotes   : item.properties.emotes,
				eyeColor : item.properties.eyeColor,
				skinColor: item.properties.skinColor,
				hairColor: item.properties.hairColor,
				showOnlyWearables: item.properties.showOnlyWearables
			})	
		
			if (item.callback) {
				item.callback()
			}
		} catch (e) {
			console.error(`AvatarManager: ProcessQueue: Failed to spawn avatar for entity ${item.parent}:`, e)
		}

		this.lastSpawnTime = Date.now()

		if (this.spawnQueue.length > 0) {
			utils.timers.setTimeout(() => {
				this.ProcessQueue()
			}, this.spawnInterval)
		} else {
			this.processQueue = false
		}
	}
}

export const avatarManager = new AvatarManager()
