import { Outfit } from 'src/_oldCode/shared/types'
import { ServerStore } from './serverStore'
import { MessageType, room } from 'src/_oldCode/room'
import { eventBus } from 'src/_oldCode/utils/eventBus'
import { _gameManager } from './gameManager'
import { sendStateUpdate } from './messaging'

const store = ServerStore.getInstance()

function getUserId(context: any): string {
	return typeof context?.from === 'string' ? context.from : 'unknown'
}


// MARK: RequestState
export async function handleRequestState(data: any, context: any) {
	const userId = getUserId(context)
	console.log('handleRequestState: userId requested state', userId)
	
	sendStateUpdate([userId])
}

// MARK: JoinGame
export async function handleRequestJoinGame(data: { displayName: string, outfit: Outfit }, context: any) {
	const userId = getUserId(context)
	_gameManager.onPlayerRequestJoin(data.displayName, data.outfit, userId)
	console.log('handleRequestJoinGame: adding userId')
}

// MARK: OutfitUpdate
export async function handleRequestOutfitUpdate(outfit: Outfit, context: any) {
	const userId = getUserId(context)
	console.log('handleRequestOutfitUpdate: updating outfit for userId', userId)

	store.setPlayerOutfit(userId, outfit)
}

// MARK: VoteAdd
export async function handleRequestAddVote(forUser: string, context: any) {
	const userId = getUserId(context)
	console.log('handleRequestVote: userId requested vote', userId, "for user", forUser)

	store.addVote(userId, forUser)
}

// MARK: VoteRemove
export async function handleRequestRemoveVote(vote: string, context: any) {
	const userId = getUserId(context)
	console.log('handleRequestVote: userId requested vote', userId, "for user", vote)

	store.removeVote(userId)
}

export function handleRequestEmote(emote: string, context: any) {
	const userId = getUserId(context)
	console.log('handleRequestEmote: userId requested emote', userId, "for emote", emote)
}

