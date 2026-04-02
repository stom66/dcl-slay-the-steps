import { MessageType, room } from "../shared/room"
import { ServerStore } from "./serverStore"


export function sendStateUpdate(to?: string[]) {
	const state = ServerStore.getInstance().getState()
	const stateMessage = {
		status       : state.status,
		gameStartTime: state.gameStartTime,
		outfits      : Array.from(state.outfits.entries()).map(([userId, outfit]) => ({
			userId    : userId,
			wearables : outfit.wearables,
			bodyShape : outfit.bodyShape,
			hairColor : outfit.hairColor,
			skinColor : outfit.skinColor,
		})),
		players      : Array.from(state.players.entries()).map(([userId, displayName]) => ({
			userId     : userId,
			displayName: displayName,
		})),
		votes        : Array.from(state.votes.entries()).map(([userId, vote]) => ({
			userId: userId,
			vote  : vote,
		})),
	}
	const recipients = to ? { to : to } : {}
	room.send(MessageType.NOTIFY_STATE, stateMessage, recipients)
}


export function sendVotingResults() {
	const state = ServerStore.getInstance().getState()
	const votingResults = {
		voteResults: Array.from(state.votes.entries()).map(([voteFrom, voteFor]) => [voteFrom, voteFor]),
	}
	room.send(MessageType.NOTIFY_STATE_VOTE_RESULTS, votingResults)
}

export function sendServerTime() {
	room.send(MessageType.NOTIFY_SERVER_TIME, Date.now())
}