import { NotifyStatePayload, ServerState } from "src/shared/types"
import { MessageType, room } from "../shared/room"
import { ServerStore } from "./serverStore"


export function sendStateUpdate(to?: string[]) {
	console.log('serverMessaging: sendStateUpdate, state:', ServerStore.getInstance().getState())
	const state       : ServerState = ServerStore.getInstance().getState()
	const stateMessage: NotifyStatePayload = {
		gameStartTime: state.gameStartTime,
		outfits      : Array.from(state.outfits.entries()).map(([userId, outfit]) => ({
			bodyShape : outfit.bodyShape,
			hairColor : outfit.hairColor,
			skinColor : outfit.skinColor,
			userId    : userId,
			wearables : outfit.wearables,
		})),
		players      : Array.from(state.players.entries()).map(([userId, displayName]) => ({
			displayName: displayName,
			userId     : userId,
		})),
		sentAt       : Date.now(),
		serverTime   : Date.now(),
		status       : state.status,
		votes        : Array.from(state.votes.entries()).map(([userId, vote]) => ({
			userId: userId,
			vote  : vote,
		})),
	}

	const recipients = to ? { to : to } : {}
	room.send(MessageType.NOTIFY_STATE, stateMessage, recipients)
}


export function sendServerTime() {
	room.send(MessageType.NOTIFY_SERVER_TIME, Date.now())
}