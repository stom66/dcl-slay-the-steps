import { eventBus } from "src/shared/utils/eventBus"
import { ClientState } from "src/shared/types"
import { GameStatus } from "src/shared/enums"

import { ClientEvents } from "src/client/clientEvents"
import { ClientStore } from "src/client/clientStore"
import { SeatManager } from "src/client/seatManager"
import { MannequinManager } from "src/client/mannequinManager"


export namespace gameStateHandler {
	var currentStatus: GameStatus = GameStatus.LOBBY
	const clientStore = ClientStore.getInstance()

	export function init() {
		eventBus.on(ClientEvents.NOTIFY_STATE, (state: ClientState) => {
			if (state.serverStatus !== currentStatus) {
				currentStatus = state.serverStatus
				switch (currentStatus) {
					case GameStatus.LOBBY:
						onStateLobby(state)
						break
					case GameStatus.STARTING:
						onStateStarting(state)
						break
					case GameStatus.STARTED:
						onStateStarted(state)
						break
					case GameStatus.ROUND_ACTIVE:
						onStateRoundActive(state)
						break
					case GameStatus.VOTING:
						onStateVoteStart(state)
						break
					case GameStatus.GAME_ENDED:
						onStateGameEnded(state)
						break
				}
			}

			if (state.playersInGame.has(clientStore.getUserId())) {
				clientStore.setEnrolledInGame(true)
			} else {
				clientStore.setEnrolledInGame(false)
			}
		})
	}

	function onStateLobby(state: ClientState) {

	}

	function onStateStarting(state: ClientState) {
		console.log('gameStateHandler: onStateStarting: state', state)

	}

	function onStateStarted(state: ClientState) {
		console.log('gameStateHandler: onStateStarted: state', state)
		
		if (!clientStore.isEnrolledInGame()) return
		console.log('gameStateHandler: onStateStarting: client isEnrolled')
		
		const playerIds = [...clientStore.getPlayers().keys()]
		const playerIndex = playerIds.indexOf(clientStore.getUserId())
		if (playerIndex !== -1) {
			console.log('gameStateHandler: onStateStarting: moving player to seat', playerIndex)
			SeatManager.MovePlayerToSeat(playerIndex)
			MannequinManager.HideNPCMannequin()
		} else {
			console.error('gameStateHandler: onStateStarting: player not found')
		}

	}

	function onStateRoundActive(state: ClientState) {
		console.log('gameStateHandler: onStateRoundActive: state', state)
	}

	function onStateVoteStart(state: ClientState) {
		console.log('gameStateHandler: onStateVoteStart: state', state)
	}

	function onStateVoteResults(state: ClientState) {
		console.log('gameStateHandler: onStateVoteResults: state', state)
	}

	function onStateGameEnded(state: ClientState) {
		console.log('gameStateHandler: onStateGameEnded: state', state)
		SeatManager.MovePlayerToLobby()
		MannequinManager.ShowNPCMannequin()
	}

}