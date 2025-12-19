import { AvatarShape, engine, Entity, Transform } from "@dcl/sdk/ecs"
import { shopData, ShopSlot } from "./shopData"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

class ShopManager {

	spawnedItems: Record<string, Entity> = {}
	constructor() {
		console.log("ShopManager constructor")
	}

	init() {
		console.log("ShopManager init")
		this.SpawnAllDefaultItems()
	}

	SpawnAllDefaultItems() {
		console.log("ShopManager SpawnAllItems")

		Object.entries(shopData).forEach(([key, item]: [string, ShopSlot]) => {
			this.spawnedItems[key] = this.SpawnItem(item)
		})
	}

	SpawnItem(
		item: ShopSlot, 
		urn?: string
	) {
		console.log("ShopManager SpawnItem: item", item)

		const entity   = engine.addEntity()

		Transform.create(entity, {
			position: item.position || Vector3.Zero(),
			rotation: item.rotation || Quaternion.Identity(),
			scale   : item.scale || Vector3.One()

		})

		AvatarShape.create(entity, {
			id               : '',
			emotes           : [],
			bodyShape        : item.isMale ? 'urn:decentraland:off-chain:base-avatars:BaseMale' : 'urn:decentraland:off-chain:base-avatars:BaseFemale',
			wearables        : [ urn ?? item.defaultUrn ?? '' ],
			showOnlyWearables: item.showAvatar ? false : true,
			eyeColor         : item.eyeColor || undefined,
			skinColor        : item.skinColor || undefined,
			hairColor        : item.hairColor || undefined
		})

		return entity
	}
}

export const _ShopManager = new ShopManager()
