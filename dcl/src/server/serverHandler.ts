import { Outfit } from 'src/types/sharedTypes'
import { getServerStore } from './serverStore'
import { MessageType, room } from 'src/room'
import { eventBus } from 'src/utils/eventBus'
import { _gameManager } from './gameManager'
import { sendStateUpdate } from './messaging'



function getUserId(context: any): string {
	return typeof context?.from === 'string' ? context.from : 'unknown'
}

// MARK: JoinGame
export async function handleRequestJoinGame(data: { displayName: string, userId: string, outfit: Outfit }, context: any) {
	const userId = getUserId(context)
	_gameManager.onPlayerRequestJoin(data)
	console.log('handleRequestJoinGame: adding userId')
}

// MARK: OutfitUpdate
export async function handleRequestOutfitUpdate(outfit: Outfit, context: any) {
	const userId = getUserId(context)
	console.log('handleRequestOutfitUpdate: updating outfit for userId', userId)

	const store = getServerStore()
	store.setPlayerOutfit(userId, outfit)
}

// MARK: StateRequest
export async function handleRequestState(context: any) {
	const userId = getUserId(context)
	console.log('handleRequestState: userId requested state', userId)
	
	sendStateUpdate([userId])
}

// MARK: VoteAdd
export async function handleRequestAddVote(forUser: string, context: any) {
	const fromUser = getUserId(context)
	console.log('handleRequestVote: userId requested vote', fromUser, "for user", forUser)

	const store = getServerStore()
	store.addVote(fromUser, forUser)
}

// MARK: VoteRemove
export async function handleRequestRemoveVote(vote: string, context: any) {
	const userId = getUserId(context)
	console.log('handleRequestVote: userId requested vote', userId, "for user", vote)

	const store = getServerStore()
	store.removeVote(userId)
}

export function handleRequestEmote(emote: string, context: any) {
	const userId = getUserId(context)
	console.log('handleRequestEmote: userId requested emote', userId, "for emote", emote)
}

