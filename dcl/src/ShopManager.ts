import { AvatarShape, engine, Entity, Transform } from "@dcl/sdk/ecs"
import { shopData, ShopItem } from "./shopData"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

class ShopManager {

	spawnedItems: Record<string, Entity> = {}
	constructor() {
		console.log("ShopManager constructor")
	}

	init() {
		console.log("ShopManager init")
		this.SpawnAllItems()
	}

	SpawnAllItems() {
		console.log("ShopManager SpawnAllItems")

		Object.entries(shopData).forEach(([key, item]: [string, ShopItem]) => {
			this.SpawnItem(key, item)
		})
	}

	SpawnItem(key: string,item: ShopItem) {
		console.log("ShopManager SpawnItem: key", key, "item", item)

		const entity   = engine.addEntity()
		const position = item.position || Vector3.Zero()
		const rotation = item.rotation || Quaternion.Zero()
		const scale    = item.scale || Vector3.One()

		Transform.create(entity, {
			position: position,
			rotation: rotation,
			scale: scale
		})

		AvatarShape.create(entity, {
			id: '',
			emotes: [],
			bodyShape: item.isMale ? 'urn:decentraland:off-chain:base-avatars:BaseMale' : 'urn:decentraland:off-chain:base-avatars:BaseFemale',
			wearables: [ item.urn ],
			showOnlyWearables: item.showAvatar ? false : true
		})

		this.spawnedItems[key] = entity
	}
}

export const _ShopManager = new ShopManager()