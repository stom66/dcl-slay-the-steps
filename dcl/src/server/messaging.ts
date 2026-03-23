import { MessageType, room } from "src/room"
import { getServerStore } from "./serverStore"


export function sendStateUpdate(to?: string[]) {
	const state = getServerStore().getState()
	const stateMessage = {
		status: state.status,
		gameStartTime: state.gameStartTime,
		outfits: Array.from(state.outfits.values()).map(outfit => ({
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
	room.send(MessageType.NOTIFY_STATE, stateMessage, recipients)
}


export function sendVotingResults() {
	const state = getServerStore().getState()
	const votingResults = {
		voteResults: Array.from(state.votes.entries()).map(([voteFrom, voteFor]) => [voteFrom, voteFor]),
	}
	room.send(MessageType.NOTIFY_VOTE_RESULTS, votingResults)
}