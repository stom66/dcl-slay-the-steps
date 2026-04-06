import { eventBus } from "src/_oldCode/utils/eventBus";
import { MessageType, room } from "src/_oldCode/room";

import { ShowWarning } from "./ui/ui.game.warning";
import { NotifyPlayerListPayload, NotifyStatePayload } from "src/_oldCode/shared/types";
import { ClientStore } from "./clientStore";

export namespace ClientHandlers {
	export function init() {
		room.onMessage(MessageType.NOTIFY_WARNING, (message)   => { handleNotifyWarning(message) })
		room.onMessage(MessageType.NOTIFY_STATE, (data)        => { handleNotifyState(data) })
		room.onMessage(MessageType.NOTIFY_PLAYER_LIST, (data)  => { handleNotifyPlayerList(data) })
		room.onMessage(MessageType.NOTIFY_VOTE_RESULTS, (data) => { handleNotifyVoteResults(data.voteResults) })
		room.onMessage(MessageType.NOTIFY_EMOTE, (data)        => { handleNotifyEmote(data.userId, data.emote) })
	}
		
	function handleNotifyState(state: NotifyStatePayload) {
		console.log('handleNotifyState: state', state)
		eventBus.emit(MessageType.NOTIFY_STATE, state)
	}

	function handleNotifyPlayerList(players: NotifyPlayerListPayload) {
		console.log('handleNotifyPlayerList: players', players)
		eventBus.emit(MessageType.NOTIFY_PLAYER_LIST, players)
	}

	function handleNotifyVoteResults(voteResults: string[][]) {
		console.log('handleNotifyVoteResults: voteResults', voteResults)
		eventBus.emit(MessageType.NOTIFY_VOTE_RESULTS, voteResults)
	}

	function handleNotifyEmote(userId: string, emote: string) {
		console.log('handleNotifyEmote: emote', emote)
		eventBus.emit(MessageType.NOTIFY_EMOTE, { userId: userId, emote: emote })
	}

	function handleNotifyWarning(warning: string) {
		console.log('handleNotifyWarning: warning', warning)
		ShowWarning(warning)
	}
}



