import { eventBus } from "../shared/utils/eventBus";
import { MessageType, room } from "../shared/room";

import { NotifyPlayerListPayload, NotifyStatePayload } from "../shared/types";

export namespace ClientHandler {
	export function init() {
		room.onMessage(MessageType.NOTIFY_STATE_LOBBY, (data)        => { handleNotifyStateLobby(data) })
		room.onMessage(MessageType.NOTIFY_STATE_STARTING, (data)     => { handleNotifyStateStarting(data) })
		room.onMessage(MessageType.NOTIFY_STATE_ROUND_START, (data)  => { handleNotifyStateRoundStart(data) })
		room.onMessage(MessageType.NOTIFY_STATE_VOTE_START, (data)   => { handleNotifyStateVoteStart(data) })
		room.onMessage(MessageType.NOTIFY_STATE_VOTE_RESULTS, (data) => { handleNotifyVoteResults(data.voteResults) })
		room.onMessage(MessageType.NOTIFY_PLAYER_LIST, (data)        => { handleNotifyPlayerList(data) })
		room.onMessage(MessageType.NOTIFY_EMOTE, (data)              => { handleNotifyEmote(data.userId, data.emote) })
		room.onMessage(MessageType.NOTIFY_WARNING, (message)         => { handleNotifyWarning(message) })
	}
		
	function handleNotifyStateLobby(state: any) {
		console.log('handleNotifyStateLobby: state', state)
		eventBus.emit(MessageType.NOTIFY_STATE_LOBBY, state)
	}

	function handleNotifyStateStarting(state: any) {
		console.log('handleNotifyStateStarting: state', state)
		eventBus.emit(MessageType.NOTIFY_STATE_STARTING, state)
	}

	function handleNotifyStateRoundStart(state: any) {
		console.log('handleNotifyStateRoundStart: state', state)
		eventBus.emit(MessageType.NOTIFY_STATE_ROUND_START, state)
	}

	function handleNotifyStateVoteStart(state: any) {
		console.log('handleNotifyStateVoteStart: state', state)
		eventBus.emit(MessageType.NOTIFY_STATE_VOTE_START, state)
	}

	function handleNotifyPlayerList(players: NotifyPlayerListPayload) {
		console.log('handleNotifyPlayerList: players', players)
		eventBus.emit(MessageType.NOTIFY_PLAYER_LIST, players)
	}

	function handleNotifyVoteResults(voteResults: string[][]) {
		console.log('handleNotifyVoteResults: voteResults', voteResults)
		eventBus.emit(MessageType.NOTIFY_STATE_VOTE_RESULTS, voteResults)
	}

	function handleNotifyEmote(userId: string, emote: string) {
		console.log('handleNotifyEmote: emote', emote)
		eventBus.emit(MessageType.NOTIFY_EMOTE, { userId: userId, emote: emote })
	}

	function handleNotifyWarning(warning: string) {
		console.log('handleNotifyWarning: warning', warning)
		eventBus.emit(MessageType.NOTIFY_WARNING, warning)
	}
}



