import { eventBus } from "src/_oldCode/utils/eventBus"
import { ServerStore } from "./serverStore"
import { GameStatus } from "src/_oldCode/utils/enums"
import { MessageType, room } from "src/_oldCode/room"
import { Outfit } from "src/_oldCode/shared/types"
import { GameSettings } from "src/_oldCode/shared/settings"
import { sendStateUpdate, sendVotingResults } from "./messaging"

class GameManager {
	static instance: GameManager

	store: ServerStore

	constructor() {
		this.store = ServerStore.getInstance()
	}

	init() {
		
		//eventBus.on('player:joined', (userId: string) => {
		//	this.onPlayerJoined(userId)
		//})
	}

	// MARK: onPlayerRequestJoin
	onPlayerRequestJoin(displayName: string, outfit: Outfit, userId: string) {
		console.log(`GameManager: onPlayerRequestJoin: userId ${userId} requested to join the game`)
		
		const state = this.store.getState()

		// Ignore them if they're already in the game
		if (state.players.has(userId)) {
			console.log(`GameManager: onPlayerRequestJoin: User ${userId} is already in the game, ignoring request to join`)
			room.send(MessageType.NOTIFY_WARNING, `You are already in the game, please wait for it to start!`)
			return
		}

		// Ensure the game hasn't already started
		if (state.status !== GameStatus.IDLE && state.status !== GameStatus.STARTING) {
			console.log(`GameManager: onPlayerRequestJoin: Game is not in the IDLE or STARTING state, ignoring request to join`)
			room.send(MessageType.NOTIFY_WARNING, `A Game is currently in progress, please wait for the next game!`)
			return
		}

		// Ensure we've not got too many players
		if (state.players.size >= GameSettings.MAX_PLAYERS) {
			console.log(`GameManager: onPlayerRequestJoin: Max players reached, ignoring request to join`)
			room.send(MessageType.NOTIFY_WARNING, `The current game is full, please wait for the next game!`)
			return
		}

		this.store.addPlayer(userId, displayName, outfit)

		// If the game needs to start, then start it
		if (state.status === GameStatus.IDLE) {
			this.startGameCountdown()
		}
	}

	// MARK: startGameCountdown
	startGameCountdown() {
		if (this.store.getState().status !== GameStatus.IDLE) {
			console.log(`GameManager: startGame: Game is not in the IDLE state, ignoring request to start`)
			return
		}

		this.store.setState(GameStatus.STARTING)
		this.store.setGameStartTime(Date.now() + GameSettings.COUNTDOWN_DURATION * 1000)
		sendStateUpdate()

		setTimeout(() => {
			this.startGame()
		}, GameSettings.COUNTDOWN_DURATION * 1000)
	}

	// MARK: startGame
	startGame() {
		this.store.setState(GameStatus.ROUND_ACTIVE)
		sendStateUpdate()

		const playerCount = this.store.getState().players.size
		
		let gameDuration = 0
		gameDuration += GameSettings.ROUND_START_DELAY
		gameDuration += GameSettings.ROUND_INTERVAL * (playerCount - 1)
		gameDuration += GameSettings.ROUND_DURATION_PER_PLAYER * playerCount

		setTimeout(() => {
			this.triggerVotingStart()
		}, gameDuration * 1000)
	}

	// MARK: triggerVotingStart
	triggerVotingStart() {
		// Ensure the round hasn't been aborted
		if (this.store.getState().status !== GameStatus.ROUND_ACTIVE) {
			console.log(`GameManager: triggerVotingStart: Game is not in the ROUND_ACTIVE state, ignoring request to start voting`)
			return
		}

		this.store.setState(GameStatus.VOTING)
		sendStateUpdate()
	}

	// MARK: triggerVotingEnd
	triggerVotingEnd() {
		this.store.setState(GameStatus.GAME_ENDED)
		sendVotingResults()
	}

	// MARK: triggerGameEnded
	triggerGameEnded() {
		this.store.setState(GameStatus.IDLE)
		sendStateUpdate()
	}

	abortGame() {
		this.store.setState(GameStatus.IDLE)
		sendStateUpdate()
		// TODO: send an alert?
	}
}

export const _gameManager = new GameManager()