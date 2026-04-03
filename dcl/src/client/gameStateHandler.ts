import { eventBus } from "src/shared/utils/eventBus"
import { NotifyStatePayload } from "src/shared/types"
import { GameStatus } from "src/shared/enums"

import { ClientEvents } from "src/client/clientEvents"
import { ClientStore } from "src/client/clientStore"
import { SeatManager } from "src/client/seatManager"
import { MannequinManager } from "src/client/mannequinManager"


export namespace gameStateHandler {
	var status: GameStatus = GameStatus.LOBBY
	const clientStore = ClientStore.getInstance()

	export function init() {
		eventBus.on(ClientEvents.NOTIFY_STATE, (state) => {
			// See if the state has actually changed
			if (state.status !== status) {
				status = state.status
				switch (status) {
					case GameStatus.LOBBY:
						onStateLobby(state)
						break
					case GameStatus.STARTING:
						onStateStarting(state)
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

			// Check if the player is enrolled in the game
			if (state.players.has(clientStore.getUserId())) {
				clientStore.setEnrolledInGame(true)
			} else {
				clientStore.setEnrolledInGame(false)
			}
		})
	}

	function onStateLobby(state: NotifyStatePayload) {

	}

	function onStateStarting(state: NotifyStatePayload) {
		console.log('gameStateHandler: onStateStarting: state', state)

	}

	function onStateRoundActive(state: NotifyStatePayload) {
		console.log('gameStateHandler: onStateRoundActive: state', state)
		
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

	function onStateVoteStart(state: NotifyStatePayload) {
		console.log('gameStateHandler: onStateVoteStart: state', state)
	}

	function onStateVoteResults(state: NotifyStatePayload) {
		console.log('gameStateHandler: onStateVoteResults: state', state)
	}

	function onStateGameEnded(state: NotifyStatePayload) {
		console.log('gameStateHandler: onStateGameEnded: state', state)
		clientStore.resetServerState()

		if (!clientStore.isEnrolledInGame()) return

		clientStore.setEnrolledInGame(false)
		SeatManager.MovePlayerToLobby()
		MannequinManager.ShowNPCMannequin()
	}

}