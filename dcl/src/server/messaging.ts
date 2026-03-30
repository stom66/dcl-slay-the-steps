import { MessageType, room } from "../shared/room"
import { ServerStore } from "./serverStore"


export function sendStateUpdate(to?: string[]) {
/* 	const state = ServerStore.getInstance().getState()
	const stateMessage = {
		status: state.status,
		gameStartTime: state.gameStartTime,
		// outfits are stored by userId, so we need to map them to the userId
		outfits: Array.from(state.outfits.entries()).map(([userId, outfit]) => ({
			userId   : userId,
			wearables: outfit.wearables,
			bodyShape: outfit.bodyShape,
			hairColor: outfit.hairColor,
			skinColor: outfit.skinColor,
		})),
		players: Array.from(state.players.entries()).map(([userId, displayName]) => ({
			userId     : userId,
			displayName: displayName,
		})),
	}
	const recipients = to ? { to : to } : undefined
	room.send(MessageType.NOTIFY_STATE, stateMessage, recipients) */

	// OLD, not needed for new architecture?
}


export function sendVotingResults() {
	const state = ServerStore.getInstance().getState()
	const votingResults = {
		voteResults: Array.from(state.votes.entries()).map(([voteFrom, voteFor]) => [voteFrom, voteFor]),
	}
	room.send(MessageType.NOTIFY_STATE_VOTE_RESULTS, votingResults)
}