import { engine, InputAction, pointerEventsSystem } from "@dcl/sdk/ecs"
import { teleportTo } from "~system/RestrictedActions"

export function SetupPortal() {

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
		() => { 
			teleportTo({
				worldCoordinates: { x: 0, y: 0 }
			})
		}
	)
}