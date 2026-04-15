import { MessageType, room } from "src/shared/room"
import { NotifyStatePayload, ServerState } from "src/shared/types"

import { ServerStore } from "src/server/serverStore"


// MARK: sendStateUpdate
export function sendStateUpdate(to?: string[]) {
	const state       : ServerState = ServerStore.getInstance().getState()
	const stateMessage: NotifyStatePayload = {
		gameStartTime: state.gameStartTime,
		players      : Array.from(state.players.entries()).map(([userId, displayName]) => ({
			displayName: displayName,
			userId     : userId,
		})),
		spectators   : Array.from(state.spectators.entries()).map(([userId, displayName]) => ({
			displayName: displayName,
			userId     : userId,
		})),
		sentAt       : Date.now(),
		status       : state.status,
		voteResults  : Array.from(state.votes.entries()).map(([userId, voteFor]) => ({
			userId    : userId,
			voteFor   : voteFor,
		})),
		lastWinner   : state.lastWinner
	}

	console.log('serverMessaging: sendStateUpdate, state:', stateMessage)

	const recipients = to ? { to : to } : {}
	room.send(MessageType.NOTIFY_STATE, stateMessage, recipients)
}


// MARK: sendServerTime
export function sendServerTime() {
	room.send(MessageType.NOTIFY_SERVER_TIME, Date.now())
}
