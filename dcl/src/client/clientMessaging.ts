// Handles messages sent from the client, to the server

import { Outfit } from "src/shared/types"
import { ClientStore } from "./clientStore"
import { MessageType, room } from "src/shared/room"

const clientStore = ClientStore.getInstance()

export namespace ClientMessaging {


	// MARK: Request Outfit Change
	export function RequestOutfitChange() {
		// Ignore if we're not enrolled in the game
		if (!clientStore.isEnrolledInGame()) return

		// Let the server know about the new outfit
		const outfit: Outfit = {
			wearables: clientStore.getNPCWearables().map(w => w.urn),
			bodyShape: clientStore.getNPCBodyShape(),
			hairColor: clientStore.getNPCHairColor(),
			skinColor: clientStore.getNPCSkinColor(),
		}
		room.send(MessageType.REQUEST_OUTFIT_UPDATE, outfit)
	}
}