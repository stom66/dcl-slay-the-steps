import { eventBus } from "src/utils/eventBus";
import { GameState } from "./gameManager";
import { MessageType, room } from "src/room";


export namespace ClientHandlers {
	export function init() {
		room.onMessage(MessageType.NOTIFY_WARNING, (message)          => { handleNotifyWarning(message) })
		room.onMessage(MessageType.NOTIFY_STATE, (state)              => { handleNotifyState(state) })
		room.onMessage(MessageType.NOTIFY_PLAYER_LIST, (players)      => { handleNotifyPlayerList(players) })
		room.onMessage(MessageType.NOTIFY_VOTE_RESULTS, (voteResults) => { handleNotifyVoteResults(voteResults) })
		room.onMessage(MessageType.NOTIFY_EMOTE, (emote)              => { handleNotifyEmote(emote) })
	}
		
	function handleNotifyState(state: GameState) {
		console.log('handleNotifyState: state', state)
	}

	function handleNotifyPlayerList(players: string[]) {
		console.log('handleNotifyPlayerList: players', players)
	}

	function handleNotifyVoteResults(voteResults: string[][]) {
		console.log('handleNotifyVoteResults: voteResults', voteResults)
	}

	function handleNotifyEmote(emote: string) {
		console.log('handleNotifyEmote: emote', emote)
	}

	function handleNotifyWarning(warning: string) {
		console.log('handleNotifyWarning: warning', warning)
		eventBus.emit(MessageType.NOTIFY_WARNING, warning)
	}
}



