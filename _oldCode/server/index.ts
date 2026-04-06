import { MessageType, room } from "src/_oldCode/room"
import { handleRequestEmote, handleRequestJoinGame, handleRequestOutfitUpdate, handleRequestState, handleRequestAddVote, handleRequestRemoveVote } from "./serverHandler"
import { _gameManager } from "./gameManager"

export async function initServer(): Promise<void> {
	console.log("mainServer: mainServer()")
	
	_gameManager.init()
	
	room.onMessage(MessageType.REQUEST_EMOTE, (data, context)         => handleRequestEmote(data, context))
	room.onMessage(MessageType.REQUEST_JOIN_GAME, (data, context)     => handleRequestJoinGame(data, context))
	room.onMessage(MessageType.REQUEST_OUTFIT_UPDATE, (data, context) => handleRequestOutfitUpdate(data, context))
	room.onMessage(MessageType.REQUEST_STATE, (data, context)         => handleRequestState(data, context))
	room.onMessage(MessageType.REQUEST_ADD_VOTE, (data, context)      => handleRequestAddVote(data, context))
	room.onMessage(MessageType.REQUEST_ADD_VOTE, (data, context)      => handleRequestRemoveVote(data, context))
}