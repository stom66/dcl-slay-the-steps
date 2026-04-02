import { Outfit } from '../shared/types'
import { ServerStore } from './serverStore'
import { MessageType, room } from '../shared/room'
import { eventBus } from '../shared/utils/eventBus'
import { _gameManager } from './gameManager'
import { sendStateUpdate } from './serverMessaging'


export namespace serverHandler {

	const store = ServerStore.getInstance()

	export function init() {
		room.onMessage(MessageType.REQUEST_STATE, (data, context)         => handleRequestState(data, context))
		room.onMessage(MessageType.REQUEST_JOIN_GAME, (data, context)     => handleRequestJoinGame(data, context))
		room.onMessage(MessageType.REQUEST_OUTFIT_UPDATE, (data, context) => handleRequestOutfitUpdate(data, context))
		room.onMessage(MessageType.REQUEST_ADD_VOTE, (data, context)      => handleRequestAddVote(data, context))
		room.onMessage(MessageType.REQUEST_REMOVE_VOTE, (data, context)   => handleRequestRemoveVote(data, context))
		room.onMessage(MessageType.REQUEST_EMOTE, (data, context)         => handleRequestEmote(data, context))
	}

	
	function getUserId(context: any): string {
		return typeof context?.from === 'string' ? context.from : 'unknown'
	}
	
	
	// MARK: RequestState
	export async function handleRequestState(data: any, context: any) {
		const userId = getUserId(context)
		console.log('handleRequestState: userId requested state', userId)
	}
	
	// MARK: JoinGame
	export async function handleRequestJoinGame(data: { displayName: string, outfit: Outfit }, context: any) {
		const userId = getUserId(context)
		console.log('handleRequestJoinGame: userId', userId, 'displayName', data.displayName, 'outfit', data.outfit)

		_gameManager.onPlayerRequestJoin(data.displayName, data.outfit, userId)
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

}
