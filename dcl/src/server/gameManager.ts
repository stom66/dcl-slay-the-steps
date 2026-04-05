import * as utils from "@dcl-sdk/utils"

import { GameStatus } from "src/shared/enums"
import { MessageType, room } from "src/shared/room"
import { GameSettings } from "src/shared/settings"
import { Outfit } from "src/shared/types"

import { sendStateUpdate } from "src/server/serverMessaging"
import { ServerStore } from "src/server/serverStore"


class GameManager {
	static instance: GameManager
	private readonly store: ServerStore

	constructor() {
		this.store = ServerStore.getInstance()
	}


	// MARK: Init
	init() { }


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

		const gameStartTime = Date.now() + GameSettings.COUNTDOWN_DURATION
		this.store.setGameStartTime(gameStartTime)
		this.store.setStatus(GameStatus.STARTING)
		
		sendStateUpdate()

		utils.timers.setTimeout(() => {
			this.startGame()
		}, GameSettings.COUNTDOWN_DURATION)
	}


	// MARK: startGame
	startGame() {
		console.log(`GameManager: startGame`)
		
		// Let all the clients know the game has started
		this.store.setStatus(GameStatus.STARTED)
		sendStateUpdate()

		// Work out the timings of the turns for each player
		var playerTimings: { userId: string, startingSoonDelay: number, roundStartDelay: number }[] = []

		const playerIds = [...this.store.getState().players.keys()]
		playerIds.forEach(playerId => {
			// Work out the delay before we send this player the "you are next" message
			var StartingSoonDelay = GameSettings.ROUND_START_DELAY
			StartingSoonDelay += GameSettings.ROUND_INTERVAL * playerIds.indexOf(playerId)
			StartingSoonDelay += GameSettings.ROUND_DURATION_PER_PLAYER * playerIds.indexOf(playerId)
			StartingSoonDelay -= GameSettings.YOU_ARE_NEXT_PREEMPT_TIME
			
			// Work out the delay before we trigger the round start for this player
			var RoundStartDelay = GameSettings.ROUND_START_DELAY
			RoundStartDelay += GameSettings.ROUND_INTERVAL * playerIds.indexOf(playerId)
			RoundStartDelay += GameSettings.ROUND_DURATION_PER_PLAYER * playerIds.indexOf(playerId)

			// Store the timings for this player
			playerTimings.push({ 
				userId           : playerId, 
				startingSoonDelay: StartingSoonDelay, 
				roundStartDelay  : RoundStartDelay 
			})
		})

		console.log(`GameManager: startGame: playerTimings`, playerTimings)


		playerTimings.forEach(playerTiming => {
			// Send out the "you are next" message
			utils.timers.setTimeout(() => {
				console.log(`GameManager: startGame: sending "you are next" message to ${playerTiming.userId}`)
				room.send(MessageType.NOTIFY_TURN_STARTING_SOON, {}, { to: [playerTiming.userId] })
			}, playerTiming.startingSoonDelay)

			// Trigger the round start for this player
			utils.timers.setTimeout(() => {
				console.log(`GameManager: startGame: triggering turn start for ${playerTiming.userId}`)
				this.triggerTurnStart(playerTiming.userId)
			}, playerTiming.roundStartDelay)
		})


		// After the game duration, trigger the voting start
		const playerCount = playerIds.length		
		var gameDuration = 0
		gameDuration += GameSettings.ROUND_START_DELAY
		gameDuration += GameSettings.ROUND_INTERVAL * (playerCount - 1)
		gameDuration += GameSettings.ROUND_DURATION_PER_PLAYER * playerCount

		utils.timers.setTimeout(() => {
			this.triggerVotingStart()
		}, gameDuration)
	}


	// MARK: triggerTurnStarting
	triggerTurnStart(userId: string) {
		console.log(`GameManager: triggerTurnStarting: userId ${userId}`)
		this.store.setCurrentTurnUserId(userId)
		this.store.setStatus(GameStatus.ROUND_ACTIVE)

		const outfit = this.store.getState().outfits.get(userId)
		if (!outfit) {
			console.log(`GameManager: triggerTurnStart: User ${userId} has no outfit, ignoring request to start turn`)
			return
		}
		room.send(MessageType.NOTIFY_TURN_STARTING, {
			sentAt      : Date.now(),
			outfit      : outfit,
			userId      : userId,
			displayName: this.store.getState().players.get(userId) ?? "",
		})
	}


	// MARK: triggerEmote
	onPlayerRequestEmote(userId: string, emote: string) {
		console.log(`GameManager: triggerEmote: userId ${userId} requested to emote`, emote)
		
		if (userId == this.store.getCurrentTurnUserId()) {
			room.send(MessageType.NOTIFY_EMOTE, {
				sentAt: Date.now(),
				userId: userId,
				emote : emote,
			})
		}
	}


	// MARK: triggerVotingStart
	triggerVotingStart() {
		console.log(`GameManager: triggerVotingStart`)

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
		
		room.send(MessageType.NOTIFY_WARNING, `The game has been aborted!`, { to: this.store.getPlayerIDs() })
		this.store.resetState()
		sendStateUpdate()
	}
}

export const gameManager = new GameManager()
