import { eventBus } from "../shared/utils/eventBus";
import { MessageType, room } from "../shared/room";
import { clockSync } from "../shared/utils/clockSync";

import { NotifyPlayerListPayload, NotifyStatePayload, Outfit, ServerState } from "../shared/types";
import { ClientEvents } from "./clientEvents";
import { ClientStore } from "./clientStore";
import { GameStatus } from "src/shared/enums";

const clientStore = ClientStore.getInstance()

export namespace ClientHandler {
	export function init() {
		room.onMessage(MessageType.NOTIFY_STATE, (data)              => { handleNotifyState(data) })
		room.onMessage(MessageType.NOTIFY_PLAYER_LIST, (data)        => { handleNotifyPlayerList(data) })
		room.onMessage(MessageType.NOTIFY_EMOTE, (data)              => { handleNotifyEmote(data.userId, data.emote) })
		room.onMessage(MessageType.NOTIFY_WARNING, (data)            => { handleNotifyWarning(data) })
		room.onMessage(MessageType.NOTIFY_SERVER_TIME, (data)        => { handleNotifyServerTime(data) })
	}
	

	// MARK: State
	function handleNotifyState(state: NotifyStatePayload) {
		console.log('handleNotifyState: state', state)

		clockSync.updateOffset(state.serverTime)

		clientStore.setServerState({
			gameStartTime: clockSync.toLocalTime(state.gameStartTime),
			outfits      : new Map(state.outfits.map(o => [o.userId, o])),
			players      : new Map(state.players.map(p => [p.userId, p.displayName])),
			status       : state.status as GameStatus,
			votes        : new Map(state.votes.map(v => [v.userId, v.vote])),
		})

		eventBus.emit(ClientEvents.NOTIFY_STATE, clientStore.getServerState())
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
		eventBus.emit(ClientEvents.NOTIFY_WARNING, warning)
	}

	// MARK: Server Time
	function handleNotifyServerTime(serverTime: number) {
		console.log('handleNotifyServerTime: serverTime', serverTime)
		clockSync.updateOffset(serverTime)
	}
}



