import { ColliderLayer, engine, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { movePlayerTo, teleportTo } from "~system/RestrictedActions"

export function SetupPortal() {
	// I need a function to teleport the player to another area in Decentraland
	// So we add a collider to the portal and when the player interacts with it, we teleport them to the other area

	const portals = engine.getEntitiesByTag('portal')
	const portal = [...portals][0]
	
	pointerEventsSystem.onPointerDown(
		{ 
			entity: portal, 
			opts: { 
				button: InputAction.IA_POINTER,
				hoverText: "Return to Genesis Plaza",
				maxDistance: 5,
			}
		}, 
		() => { TeleportToGenesisPlaza() }
	)
}

function TeleportToGenesisPlaza() {
	console.log("TeleportToGenesisPlaza")
	teleportTo({
		worldCoordinates: { x: 0, y: 0 }
	})
}