import { eventBus } from "../shared/utils/eventBus";
import { MessageType, room } from "../shared/room";

import { NotifyPlayerListPayload, NotifyStatePayload, Outfit, ServerState } from "../shared/types";
import { ClientStore } from "./clientStore";
import { GameStatus } from "src/shared/enums";
import { ClientEvents } from "./clientEvents";

const clientStore = ClientStore.getInstance()

export namespace ClientHandler {
	export function init() {
		room.onMessage(MessageType.NOTIFY_STATE_LOBBY, (data)        => { handleNotifyStateLobby(data) })
		room.onMessage(MessageType.NOTIFY_STATE_STARTING, (data)     => { handleNotifyStateStarting(data) })
		room.onMessage(MessageType.NOTIFY_STATE_ROUND_START, (data)  => { handleNotifyStateRoundStart(data) })
		room.onMessage(MessageType.NOTIFY_STATE_VOTE_START, (data)   => { handleNotifyStateVoteStart(data) })
		room.onMessage(MessageType.NOTIFY_STATE_VOTE_RESULTS, (data) => { handleNotifyStateVoteResults(data.voteResults) })
		room.onMessage(MessageType.NOTIFY_PLAYER_LIST, (data)        => { handleNotifyPlayerList(data) })
		room.onMessage(MessageType.NOTIFY_EMOTE, (data)              => { handleNotifyEmote(data.userId, data.emote) })
		room.onMessage(MessageType.NOTIFY_WARNING, (data)            => { handleNotifyWarning(data) })
	}
	

	// MARK: State: Lobby
	function handleNotifyStateLobby(state: any) {
		console.log('handleNotifyStateLobby: state', state)
		clientStore.resetServerState()
	}

	// MARK: State: Starting
	function handleNotifyStateStarting(state: any) {
		console.log('handleNotifyStateStarting: state', state)
		//eventBus.emit(MessageType.NOTIFY_STATE_STARTING, state)
	}

	// MARK: State: Round Start
	function handleNotifyStateRoundStart(state: any) {
		console.log('handleNotifyStateRoundStart: state', state)
		//eventBus.emit(MessageType.NOTIFY_STATE_ROUND_START, state)
	}

	// MARK: State: Vote Start
	function handleNotifyStateVoteStart(state: any) {
		console.log('handleNotifyStateVoteStart: state', state)
		//eventBus.emit(MessageType.NOTIFY_STATE_VOTE_START, state)
	}

	// MARK: State:Vote Results
	function handleNotifyStateVoteResults(voteResults: string[][]) {
		console.log('handleNotifyStateVoteResults: voteResults', voteResults)
		//eventBus.emit(MessageType.NOTIFY_STATE_VOTE_RESULTS, voteResults)
	}

	// MARK: Player List
	function handleNotifyPlayerList(players: NotifyPlayerListPayload) {
		console.log('handleNotifyPlayerList: players', players)
		const playersMap = new Map(players.players.map(p => [p.userId, p.displayName]))
		clientStore.setPlayers(playersMap)
	}

	// MARK: Emote
	function handleNotifyEmote(userId: string, emote: string) {
		console.log('handleNotifyEmote: emote', emote)
		//eventBus.emit(MessageType.NOTIFY_EMOTE, { userId: userId, emote: emote })
	}

	// MARK: Warning
	function handleNotifyWarning(warning: string) {
		console.log('handleNotifyWarning: warning', warning)
		eventBus.emit(MessageType.NOTIFY_WARNING, warning)
	}
}



