import { Vector3 } from "@dcl/sdk/math"
import { GameSettings } from "./_settings"


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