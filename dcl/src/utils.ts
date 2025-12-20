import { getPlayer } from "@dcl/sdk/src/players"
import { getRealm } from "~system/Runtime"
import { engine } from "@dcl/sdk/ecs"
import { GetPlayerDataRequest } from "~system/Players"
import { Color3, Vector3 } from "@dcl/sdk/math"

import { GameSettings } from "./_settings"

// Workaround for env vars
declare var process : {
	env: {
		NODE_ENV: string
	}
}

// Auto enable DEBUG mode for local dev
const DEBUG = process.env.NODE_ENV == "development" 

const FORCE_BASE_URL = true

const playerProfiles: Map<string, any> = new Map()

// MARK: GetUTCTimestamp
/* export async function GetUTCTimestamp() {
	try {
		const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=UTC')
	
		if (!response.ok) {
			throw new Error("Failed to fetch UTC time: " + response.statusText)
		}
	
		const data = await response.json()
	
		if (!data.dateTime) {
			console.error("Failed to get dateTime from response data:", data)
			return false
		}
	
		// Convert ISO string to Unix timestamp in seconds
		const unixTimestamp = Math.floor(new Date(data.dateTime).getTime() / 1000)
	
		console.log("GetUTCTimestamp: ", unixTimestamp)
		return unixTimestamp
  
	} catch (error) {
		console.error('Error fetching UTC Time from API:', error)
		return false
	}
} */

// MARK: GetUTCTimestampMillis
export async function GetUTCTimestampMillis() {
	try {
		const response = await fetch(GameSettings.TIME_API_URL, {
			timeout: 1000
		})
	
		if (!response.ok) {
			throw new Error("Failed to fetch UTC time: " + response.statusText)
		}
	
		const data = await response.json()
	
		if (!data.dateTime) {
			console.error("Failed to get dateTime from response data:", data)
			return Date.UTC(Date.now()) * 1000 as number
		}
	
		// Convert ISO string to Unix timestamp in seconds
		const unixTimestampMillis = Math.floor(new Date(data.dateTime).getTime()) as number
	
		console.log("GetUTCTimestampMillis:", unixTimestampMillis)
		return unixTimestampMillis
  
	} catch (error) {
		console.error('Error fetching UTC Time from API:', error)
		return Date.UTC(Date.now()) * 1000 as number
	}
}


// MARK: waitForPlayerData
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


// MARK: Profile Listener
type PlayerProfileListener = (userId: string) => void
const profileListeners = new Set<PlayerProfileListener>()

export function onPlayerProfileLoaded(listener: PlayerProfileListener) {
  profileListeners.add(listener)
  return () => profileListeners.delete(listener)
}


// MARK: GetPlayerProfile
export async function GetPlayerProfile(userId: string): Promise<any> {
	if (playerProfiles.has(userId)) {
		return playerProfiles.get(userId)
	}

	const response = await fetch(`https://peer.decentraland.org/lambdas/profiles/${userId}`)
    if (!response.ok) {
        throw new Error(`GetPlayerAvatarImage: Failed to fetch profile: ${response.statusText}`)
    }

	// Store the profile data
    const data = await response.json()
	playerProfiles.set(userId, data)

	
	// Notify subscribers
	for (const listener of profileListeners) {
		listener(userId)
	}

	return data
}


// MARK: GetPlayerName
export function GetPlayerName(userId: string): string {
	// If profile is cached, extract name from it
	if (playerProfiles.has(userId)) {
		const data = playerProfiles.get(userId)
		return data.avatars[0]?.name || userId.substring(0, 6) + "..."
	}
	
	// Start fetching in background if not cached (GetPlayerProfile already caches to playerProfiles)
	GetPlayerProfile(userId).catch((error) => {
		console.error(`GetPlayerName: Failed to fetch profile for ${userId}:`, error)
	})
	
	// Return placeholder while fetching
	return userId.substring(0, 6) + "..."
}

export async function GetPlayerNameAsync(userId: string): Promise<string> {
	const data = await GetPlayerProfile(userId)
	return data.avatars[0]?.name || userId.substring(0, 6) + ".."
}



// MARK: GetPlayerAvatarImage
export function GetPlayerAvatarImage(userId: string): string {
	// If profile is cached, extract name from it
	if (playerProfiles.has(userId)) {
		const data = playerProfiles.get(userId)
		return data.avatars[0].avatar.snapshots.face256 || ""
	}
	
	// Start fetching in background if not cached (GetPlayerProfile already caches to playerProfiles)
	GetPlayerProfile(userId).catch((error) => {
		console.error(`GetPlayerName: Failed to fetch profile for ${userId}:`, error)
	})
	
	// Return placeholder while fetching
	return ""
}

export async function GetPlayerAvatarImageAsync(userId: string): Promise<string> {
	const data = await GetPlayerProfile(userId)
	return data.avatars[0].avatar.snapshots.face256
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

export type NPCOutfit = {
	name     : string
	bodyShape: string
	wearables: string[]
	emotes   : string[]
	eyeColor : Color3
	skinColor: Color3
	hairColor: Color3
}




export function GetBackgroundTexture(isEven: boolean) {
	return isEven
		? "assets/images/ui/bg-lighter.png"
		: "assets/images/ui/bg-default.png";
}