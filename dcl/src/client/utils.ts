import { Color3, Vector3 } from "@dcl/sdk/math"
import { GameSettings } from "src/shared/settings"

import { Wearable } from "src/client/data/shopSlotData"
import { ShopZone } from "src/client/data/shopZoneData"



export function GetRandomPointInCircle(
	center: Vector3, 
	radius: number
) {
	const randomRadius = (Math.random() * (radius - 0.5)) + 0.5
	const angle = Math.random() * 2 * Math.PI
	const x     = randomRadius * Math.cos(angle)
	const z     = randomRadius * Math.sin(angle)
	const point = Vector3.create(x, center.y, z)
	return Vector3.add(center, point)
}



export function GetBackgroundTexture(isEven: boolean) {
	return isEven
		? "assets/images/ui/bg-lighter.png"
		: "assets/images/ui/bg-default.png";
}

export async function FetchZoneItems( zone: ShopZone ) {
	console.log(`ShopManager: FetchZoneItems: fetching items for zone "${zone.key}, page: ${zone.currentPage}, limit: ${zone.slots.length}"`)

	// Fetch new items from API
	const pageSize = zone.slots.length || 1
	const skip     = (zone.currentPage || 0) * pageSize
	const url      = buildAPIUrl(zone, skip, pageSize)
	if (!url) {
		console.error(`ShopManager: Couldn't build API URL for zone "${zone.key}"`)
		return
	}

	try {
		const response = await fetch(url)
		const data = await response.json()
		console.log(`ShopManager: Fetched ${data.data?.length || 0} items from API for zone "${zone.key}"`)

		// Create data for new item
		// An example of the API response: https://marketplace-api.decentraland.org/v1/items?skip=5&first=5&itemType=wearable&wearableCategory=helmet
		if (data.data && Array.isArray(data.data)) {
			for (const [index, apiItem] of data.data.entries()) {
				if (!zone.slots[index]) {
					console.log(`ShopManager: No slot found at index ${index} for zone "${zone.key}"`)
					continue
				}

				zone.slots[index].currentWearable = {
					bodyShapes     : apiItem.data?.wearable?.bodyShapes,
					category       : apiItem.data?.wearable?.category,
					description    : apiItem.data?.wearable?.description,
					contractAddress: apiItem.contractAddress,
					creator        : apiItem.creator,
					name           : apiItem.name,
					rarity         : apiItem.rarity,
					urn            : apiItem.urn,
				} as Wearable

				//const itemEntity = this.spawnItem(zone.slots[index])
				//this.zoneItems[zoneKey].push(itemEntity)
			}
		}

		return true
	} catch (error) {
		console.error(`ShopManager: Failed to update items for zone "${zone.key}":`, error)
	}
}



/**
 * Build the API URL for fetching items for a specific zone
 */
function buildAPIUrl(
	zone : ShopZone,
	skip : number = 0,
	limit: number = 1
): string | null {
	
	// Build URL parameters
	const params: string[] = []
	params.push(`skip=${skip}`)
	params.push(`first=${limit}`) // API uses 'first' instead of 'limit'
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
	console.log(`ShopManager: Built API URL for zone "${zone.key}": ${url}`)
	return url
}



// Fetch a single wearable's metadata
export async function GetWearableData(urn: string): Promise<Wearable> {
	const defaultData = {
		bodyShapes     : [],
		category       : "",
		creator        : "",
		contractAddress: "",
		name           : "",
		rarity         : "",
		urn            : urn,
	}

	try {
		// Example: urn:decentraland:matic:collections-v2:0xf55afae51e08920469fcfd05c6d1c9905370e3d1:5:526561458342785933489590138418352161594475477002745556271554887684 :  {"bodyShapes":[],"category":"","contractAddress":"","name":"","rarity":"","urn":"urn:decentraland:matic:collections-v2:0xf55afae51e08920469fcfd05c6d1c9905370e3d1:5:526561458342785933489590138418352161594475477002745556271554887684"}
		// First, break the urn down into it's parts, split by ":". The 5th part of the urn is the contract id
		// The 6th part of the urn is the item id
		const parts = urn.split(":")
		const contractId = parts[4]
		const itemId = parts[5]

		// If there isn't an itemID, then this is a built-in item
		if (!itemId) {
			return defaultData
		}

		const url      = GameSettings.URL_WEARABLE_DATA_API + "?contractAddress=" + encodeURIComponent(contractId)
		const response = await fetch(url)
		const json     = await response.json()
		//console.log("OutfitManager: GetWearableData: got wearable data for", urn, JSON.stringify(json))

		// At this point we get a table of data back with n entries. We need to cycle through those entries and find the one with the matching itemId value
		// An example of the API response: https://marketplace-api.decentraland.org/v1/items?contractAddress=0x9889b023641eab84d0831d21ea89184eba6c1c16
		for (const entry of json.data) {
			if (entry.itemId === itemId) {

				const wearable: Wearable = {
					bodyShapes     : entry.data.wearable.bodyShapes ?? [],
					category       : entry.data.wearable.category ?? "",
					contractAddress: entry.contractAddress ?? "",
					description    : entry.data.wearable.description ?? "",
					creator        : entry.creator ?? "",
					name           : entry.name ?? "",
					rarity         : entry.rarity ?? "",
					urn            : urn,
				}
				return wearable
			}
		}

		// If we didn't find a match, return the default data
		return defaultData

	} catch (err) {
		// Return default wearable with just the URN on error
		console.error("Failed to fetch wearable data for", urn, err)
		return defaultData
	}
}

export function hsvToColor3(h: number, s: number, v: number): Color3 {
	const i = Math.floor(h * 6)
	const f = h * 6 - i
	const p = v * (1 - s)
	const q = v * (1 - f * s)
	const t = v * (1 - (1 - f) * s)
  
	switch (i % 6) {
	  case 0: return Color3.create(v, t, p)
	  case 1: return Color3.create(q, v, p)
	  case 2: return Color3.create(p, v, t)
	  case 3: return Color3.create(p, q, v)
	  case 4: return Color3.create(t, p, v)
	  case 5: return Color3.create(v, p, q)
	  default: return Color3.create(0, 0, 0)
	}
  }
  