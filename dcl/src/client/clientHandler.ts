import { eventBus } from 'src/shared/utils/eventBus';
import { MessageType, room } from 'src/shared/room';
import { clockSync } from 'src/shared/utils/clockSync';

import { NotifyPlayerListPayload, NotifyStatePayload, NotifyTurnStartingPayload } from 'src/shared/types';
import { ClientEvents } from 'src/client/clientEvents';
import { ClientStore } from 'src/client/clientStore';
import { GameStatus } from 'src/shared/enums';

const clientStore = ClientStore.getInstance()

export namespace ClientHandler {
	export function init() {
		room.onMessage(MessageType.NOTIFY_ABORT_GAME, (data)         => { handleNotifyAbortGame(data) })
		room.onMessage(MessageType.NOTIFY_STATE, (data)              => { handleNotifyState(data) })
		room.onMessage(MessageType.NOTIFY_TURN_STARTING, (data)      => { handleNotifyTurnStarting(data) })
		room.onMessage(MessageType.NOTIFY_TURN_STARTING_SOON, (data) => { handleNotifyTurnStartingSoon() })
		room.onMessage(MessageType.NOTIFY_PLAYER_LIST, (data)        => { handleNotifyPlayerList(data) })
		room.onMessage(MessageType.NOTIFY_EMOTE, (data)              => { handleNotifyEmote(data.userId, data.emote) })
		room.onMessage(MessageType.NOTIFY_WARNING, (data)            => { handleNotifyWarning(data) })
		room.onMessage(MessageType.NOTIFY_SERVER_TIME, (data)        => { handleNotifyServerTime(data) })
	}
	

	// MARK: Abort Game
	function handleNotifyAbortGame(data: any) {
		console.log('ClientHandler: handleNotifyAbortGame: data', data)
		eventBus.emit(ClientEvents.NOTIFY_ABORT_GAME, data)
	}

	// MARK: State
	function handleNotifyState(data: NotifyStatePayload) {
		console.log('ClientHandler: handleNotifyState: state', data)

		clockSync.updateOffset(data.sentAt)
		clientStore.setClientState(data)

		eventBus.emit(ClientEvents.NOTIFY_STATE, clientStore.getClientState())
	}


	// MARK: Turn Starting
	function handleNotifyTurnStartingSoon() {
		console.log('ClientHandler: handleNotifyTurnStartingSoon')
		eventBus.emit(ClientEvents.NOTIFY_TURN_STARTING_SOON, {})
	}

	// MARK: Turn Starting
	function handleNotifyTurnStarting(data: NotifyTurnStartingPayload) {
		console.log('ClientHandler: handleNotifyTurnStarting')
		clockSync.updateOffset(data.sentAt)
		clientStore.setCurrentTurnUserId(data.outfit.userId)
		clientStore.setServerStatus(GameStatus.ROUND_ACTIVE)

		eventBus.emit(ClientEvents.NOTIFY_TURN_STARTING, data)
	}

	// MARK: Player List
	function handleNotifyPlayerList(data: NotifyPlayerListPayload) {
		console.log('ClientHandler: handleNotifyPlayerList: players', data)
		const playersMap = new Map(data.players.map(p => [p.userId, p.displayName]))
		clientStore.setPlayers(playersMap)
	}

	// MARK: Emote
	function handleNotifyEmote(userId: string, emote: string) {
		console.log('ClientHandler: handleNotifyEmote: emote', emote)
		//eventBus.emit(MessageType.NOTIFY_EMOTE, { userId: userId, emote: emote })
	}

	// MARK: Warning
	function handleNotifyWarning(warning: string) {
		console.log('ClientHandler: handleNotifyWarning: warning', warning)
		eventBus.emit(ClientEvents.NOTIFY_WARNING, warning)
	}

	// MARK: Server Time
	function handleNotifyServerTime(serverTime: number) {
		//console.log('ClientHandler: handleNotifyServerTime: serverTime', serverTime)
		clockSync.updateOffset(serverTime)
	}
}



