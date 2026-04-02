import { eventBus } from "src/shared/utils/eventBus"
import { ClientEvents } from "./clientEvents"
import { NotifyStatePayload } from "src/shared/types"
import { GameStatus } from "src/shared/enums"
export namespace gameStateHandler {
	var status: GameStatus = GameStatus.LOBBY

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
		})
	}

	function onStateLobby(state: NotifyStatePayload) {

	}

	function onStateStarting(state: NotifyStatePayload) {
		console.log('gameStateHandler: onStateStarting: state', state)
	}

	function onStateRoundActive(state: NotifyStatePayload) {
		console.log('gameStateHandler: onStateRoundActive: state', state)
	}

	function onStateVoteStart(state: NotifyStatePayload) {
		console.log('gameStateHandler: onStateVoteStart: state', state)
	}

	function onStateVoteResults(state: NotifyStatePayload) {
		console.log('gameStateHandler: onStateVoteResults: state', state)
	}

	function onStateGameEnded(state: NotifyStatePayload) {
		console.log('gameStateHandler: onStateGameEnded: state', state)
	}

}