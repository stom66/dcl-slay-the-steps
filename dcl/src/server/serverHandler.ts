import { MessageType, room } from 'src/shared/room'
import { Outfit } from 'src/shared/types'

import { ServerStore } from 'src/server/serverStore'
import { sendStateUpdate } from 'src/server/serverMessaging'
import { gameManager } from 'src/server/gameManager'


export namespace serverHandler {

	// MARK: Vars
	const store = ServerStore.getInstance()


	// MARK: Utility function
	function getUserId(context: any): string {
		return typeof context?.from === 'string' ? context.from : 'unknown'
	}


	// MARK: Init
	export function init() {
		room.onMessage(MessageType.REQUEST_JOIN_GAME, (data, context)     => handleRequestJoinGame(data, context))
		room.onMessage(MessageType.REQUEST_SPECTATE_GAME, (data, context) => handleRequestSpectateGame(data, context))
		room.onMessage(MessageType.REQUEST_OUTFIT_UPDATE, (data, context) => handleRequestOutfitUpdate(data.outfit, context))
		room.onMessage(MessageType.REQUEST_ADD_VOTE, (data, context)      => handleRequestAddVote(data, context))
		room.onMessage(MessageType.REQUEST_REMOVE_VOTE, (data, context)   => handleRequestRemoveVote(data, context))
		room.onMessage(MessageType.REQUEST_EMOTE, (data, context)         => handleRequestEmote(data, context))
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
		console.log('handleRequestJoinGame: userId', userId, 'displayName', data.displayName, 'outfit', data.outfit)

		gameManager.onPlayerRequestJoin(data.displayName, data.outfit, userId)
	}


	// MARK: SpectateGame
	export async function handleRequestSpectateGame(data: { displayName: string }, context: any) {
		const userId = getUserId(context)
		console.log('handleRequestSpectateGame: userId', userId, 'displayName', data.displayName)

		gameManager.onPlayerRequestSpectate(data.displayName, userId)
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


	// MARK: Emote
	export function handleRequestEmote(emote: string, context: any) {
		const userId = getUserId(context)
		console.log('handleRequestEmote: userId requested emote', userId, "for emote", emote)

		gameManager.onPlayerRequestEmote(userId, emote)
	}
}
