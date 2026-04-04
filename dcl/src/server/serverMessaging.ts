import { NotifyStatePayload, ServerState } from "src/shared/types"
import { MessageType, room } from "src/shared/room"
import { ServerStore } from "./serverStore"


export function sendStateUpdate(to?: string[]) {
	const state       : ServerState = ServerStore.getInstance().getState()
	const stateMessage: NotifyStatePayload = {
		gameStartTime: state.gameStartTime,
		players      : Array.from(state.players.entries()).map(([userId, displayName]) => ({
			displayName: displayName,
			userId     : userId,
		})),
		sentAt       : Date.now(),
		status       : state.status,
	}

	
	console.log('serverMessaging: sendStateUpdate, state:', stateMessage)

	const recipients = to ? { to : to } : {}
	room.send(MessageType.NOTIFY_STATE, stateMessage, recipients)
}


export function sendServerTime() {
	room.send(MessageType.NOTIFY_SERVER_TIME, Date.now())
}