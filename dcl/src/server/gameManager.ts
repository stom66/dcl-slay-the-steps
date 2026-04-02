import { MessageType, room } from "../shared/room"
import { GameStatus } from "../shared/enums"
import { GameSettings } from "../shared/settings"
import { Outfit } from "../shared/types"
import { ServerStore } from "./serverStore"
import { sendStateUpdate } from "./serverMessaging"
import * as utils from "@dcl-sdk/utils"

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
			room.send(MessageType.NOTIFY_WARNING, `You are already in the game, please wait for it to start!`, { to: [userId] })
			return
		}

		// Ensure the game hasn't already started
		if (state.status !== GameStatus.LOBBY && state.status !== GameStatus.STARTING) {
			console.log(`GameManager: onPlayerRequestJoin: Game is not in the IDLE or STARTING state, ignoring request to join`)
			room.send(MessageType.NOTIFY_WARNING, `A Game is currently in progress, please wait for the next game!`, { to: [userId] })
			return
		}

		// Ensure we've not got too many players
		if (state.players.size >= GameSettings.MAX_PLAYERS) {
			console.log(`GameManager: onPlayerRequestJoin: Max players reached, ignoring request to join`)
			room.send(MessageType.NOTIFY_WARNING, `The current game is full, please wait for the next game!`, { to: [userId] })
			return
		}

		this.store.addPlayer(userId, displayName, outfit)

		// If the game needs to start, then start it
		if (state.status === GameStatus.LOBBY) {
			this.startGameCountdown()
		} else {
			room.send(MessageType.NOTIFY_PLAYER_LIST, {
				sentAt: Date.now(),
				players: Array.from(state.players.entries()).map(([userId, displayName]) => ({
					userId: userId,
					displayName: displayName,
				}))
			})
		}
	}

	// MARK: startGameCountdown
	startGameCountdown() {
		console.log(`GameManager: startGameCountdown`)

		if (this.store.getState().status !== GameStatus.LOBBY) {
			console.log(`GameManager: startGame: Game is not in the LOBBY state, ignoring request to start`)
			return
		}

		this.store.setStatus(GameStatus.STARTING)

		const gameStartTime = Date.now() + GameSettings.COUNTDOWN_DURATION
		this.store.setGameStartTime(gameStartTime)

		console.log(`GameManager: startGameCountdown: gameStartTime`, gameStartTime)
		console.log(`GameManager: startGameCountdown: serverTime`, Date.now())
		console.log(`GameManager: startGameCountdown: countdown duration (calc)`, gameStartTime - Date.now())
		console.log(`GameManager: startGameCountdown: countdown duration (actual)`, GameSettings.COUNTDOWN_DURATION)

		sendStateUpdate()

		utils.timers.setTimeout(() => {
			this.startGame()
		}, GameSettings.COUNTDOWN_DURATION)
	}

	// MARK: startGame
	startGame() {
		console.log(`GameManager: startGame`)
		
		// We cycle through all the players in the current round, and send out an update ROUND_START for each player with their outfit
		this.store.setStatus(GameStatus.ROUND_ACTIVE)

		const playerCount = this.store.getPlayerCount()

		sendStateUpdate()
		
		var gameDuration = 0
		gameDuration += GameSettings.ROUND_START_DELAY
		gameDuration += GameSettings.ROUND_INTERVAL * (playerCount - 1)
		gameDuration += GameSettings.ROUND_DURATION_PER_PLAYER * playerCount

		utils.timers.setTimeout(() => {
			this.triggerVotingStart()
		}, gameDuration)
	}


	// MARK: triggerVotingStart
	triggerVotingStart() {
		console.log(`GameManager: triggerVotingStart`)
		
		// Ensure the round hasn't been aborted
		if (this.store.getState().status !== GameStatus.ROUND_ACTIVE) {
			console.log(`GameManager: triggerVotingStart: Game is not in the ROUND_ACTIVE state, ignoring request to start voting`)
			return
		}

		this.store.setStatus(GameStatus.VOTING)
		sendStateUpdate()

		utils.timers.setTimeout(() => {
			this.triggerVotingEnd()
		}, GameSettings.VOTING_DURATION)
	}


	// MARK: triggerVotingEnd
	triggerVotingEnd() {
		console.log(`GameManager: triggerVotingEnd`)
		
		this.store.setStatus(GameStatus.GAME_ENDED)
		sendStateUpdate()

		utils.timers.setTimeout(() => {
			this.triggerLobby()
		}, GameSettings.GAME_ENDED_DURATION)
	}


	// MARK: triggerLobby
	triggerLobby() {
		console.log(`GameManager: triggerLobby`)
		this.store.resetState()
		sendStateUpdate()
	}

	// MARK: abortGame
	abortGame() {
		console.log(`GameManager: abortGame`)
		
		this.store.resetState()
		sendStateUpdate()
		// TODO: send an alert?
	}
}

export const gameManager = new GameManager()