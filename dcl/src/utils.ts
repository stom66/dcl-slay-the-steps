import { getPlayer } from "@dcl/sdk/src/players"
import { getRealm } from "~system/Runtime"
import { ignoreWearableCategories, rarityValues } from "./data"
import { engine } from "@dcl/sdk/ecs"
import { GetPlayerDataRequest } from "~system/Players"

// Workaround for env vars
declare var process : {
	env: {
		NODE_ENV: string
	}
}

// Auto enable DEBUG mode for local dev
const DEBUG = process.env.NODE_ENV == "development" 

const FORCE_BASE_URL = true




export function waitForPlayerData(
	req?: GetPlayerDataRequest
): Promise<NonNullable<ReturnType<typeof getPlayer>>> {
	return new Promise(resolve => {
		const now = getPlayer(req)
		if (now) {
			resolve(now as any)
			return
		}
	
		const system = (dt: number) => {
			const p = getPlayer(req)
			if (p) {
			engine.removeSystem(system)
			resolve(p as any)
			}
		}
	
		engine.addSystem(system)
	})
}

// MARK: GetRealmInfo
async function GetRealmInfo() {
	const { realmInfo } = await getRealm({})
	if (!realmInfo) {
		console.log("GetRealmInfo(): Error: getRealm() returned null")	
		return false
	} else {
		if (DEBUG) console.log(`You are in the realm: `, realmInfo.realmName)
		return realmInfo			
	}
}


// MARK: GetBaseURL
async function GetBaseURL() {
	// The default, fall-back URL
	let baseUrl = "https://peer.decentraland.org/"
	
	// Return a static URL during Dev
	if (DEBUG || FORCE_BASE_URL) {
		return baseUrl
	}
		
	// Get the correct base URL from the RealmInfo
	const realmInfo = await GetRealmInfo()
	if (!realmInfo) { 
		console.log("GetBaseURL(): Error: unable to GetRealmInfo! Using default/dev value:", baseUrl)		
	} else {
		baseUrl = realmInfo.baseUrl		
	}
	
	// Ensure trailing slash
	if (!baseUrl.endsWith("/")) {
		baseUrl += "/"
	}
	
	console.log("GetBaseURL(): got", baseUrl)
	return baseUrl
}


// MARK: GetCurrentOutfit
// Returns all of the players current wearables, with extended data about them

export async function GetCurrentOutfit() {

	let userData = getPlayer()
	if (!userData) { 
		console.log("GetCurrentWearables(): Error: couldn't fetch userData")
		return false 
	}
	
	// Get the base URL
	const baseUrl = await GetBaseURL()
	
	// Blank container for results
	const results = []
	
	// Fetch data for each of the wearables
	for (const urn of userData.wearables) {
		// Get data from the URN
		const data = await GetWearableData(urn, baseUrl)
		
		// Ensure data is valid.
		if (!data) {
			console.log("GetCurrentWearables(): unable to GetWearablData() for urn:", urn)
			continue
		} 
		
		// Check if we should ignore the item
		if (ShouldIgnoreCategory(data.metadata.data.category)) continue;
		
		// Add item data to the results
		results.push(data)
	}
	
	if (DEBUG) console.log("GetCurrentWearables() results:", results)	
	return results	
}


//MARK: GetWearableData
export async function GetWearableData(urn: string, baseUrl?: string) {
	
	// Ensure baseUrl
	if (!baseUrl) {
		baseUrl = await GetBaseURL()		
	}
	
	// fix for different urn formats on/off-chain
	let cleanedUrn = urn
	if (urn.includes("urn:decentraland:matic:collections-v2")) { 
		const parts = urn.split(":")
		cleanedUrn  = parts.slice(0, 6).join(":");  // Keep only relevant parts
	}
	const encodedUrn = encodeURIComponent(cleanedUrn);
	
	const url = `${baseUrl}content/entities/wearables/?pointer=${encodedUrn}`;

	//console.log("Fetching wearable data for urn:", encodedUrn);
	try {
		let response = await fetch(url);

		if (!response.ok) {
			console.error("Failed to fetch data for URN:", urn, ", From URL: ", url, ", Status:", response.status);
			return;  // Skip if response is not OK
		}

		let json = await response.json();

		if (json.length > 0) {
			return json[0] // for legacy reasons the api returns an array with exactly 1 element
		} else {
			console.error("No wearable data found for URN:", urn);
		}
	} catch (error) {
		console.error("Error fetching wearable data for URN:", urn, error);
	}
}


// MARK: GetOutfitScore
export function GetOutfitScore(wearables: any, wearableHistory: any) {
	// Input is an array of wearables, and an array of arrays of wearables
	// Start building the score
	let score = 0

	// Loop through each item in the outfit
	for (const item of wearables) {
		const itemData = item.metadata
		
		// Get score value for item
		let itemScore = GetRarityValue(itemData.rarity)
		
		if (ItemHasBeenWornBefore(item, wearableHistory)) {
			//if (DEBUG) console.log("Item already worn, reduced points", itemData.name)				
			itemScore = Math.max(Math.floor(itemScore / 2), 1) // floor it, and clamp to min 1
		}
		
		// Add item score
		score += itemScore
	}

	if (DEBUG) console.log("Wearables Score:", score)
	return score
}


//MARK: ItemHasBeenWornBefore
export function ItemHasBeenWornBefore(item: any, history: any): boolean {
	// Iterate through previous outfits
	for (const previousOutfit of history) {
		// Iterate through outfit wearables
		for (const prevItem of previousOutfit) {
			
			// Check if it matches the item
			if (prevItem.metadata.id === item.metadata.id) {
				return true
			}
		}
	}
	return false
}


// MARK: ShouldIgnoreCategory
export function ShouldIgnoreCategory(category: string): boolean {
    return ignoreWearableCategories[category] === true;
}


// MARK: GetRarityValue
export function GetRarityValue(rarityName: string) {
	return rarityValues[rarityName] || 1
}