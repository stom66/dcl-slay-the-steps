import { AvatarShape, engine, GltfContainer, InputAction, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { onEnterScene, onLeaveScene } from "@dcl/sdk/players"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"
import { MessageBus } from "@dcl/sdk/message-bus"

import { GetPlayerProfile, GetUTCTimestampMillis, waitForPlayerData } from "./utils"

import { GameSettings } from "./_settings"
import { _StageController } from "./StageController"
import { _SeatManager } from "./SeatManager"
import { _CameraController } from "./CameraController"

import { UpdatePlayerList } from "./ui.Game.PlayerList"
import { ShowWarning } from "./ui.Game.Warning"
import { HideCountdownTimer, ShowCountdownTimer } from "./ui.Game.CountdownTimer"
import { HideVotingOptions, ShowVotingOptions } from "./ui.Game.VotingOptions"
import { HideVotingResults, ShowVotingResults } from "./ui.Game.VotingResults"

import * as utils from '@dcl-sdk/utils'


export enum GameStatus {
	IDLE         = "IDLE",
	STARTING     = "STARTING",
	ROUND_ACTIVE = "ROUND_ACTIVE",
	VOTING       = "VOTING",
	GAME_ENDED   = "GAME_ENDED",
}

export type GameState = {
	gameState    : GameStatus,
	hostUserId   : string,
	players      : string[],
	gameStartTime: number,
	votes        : { [key: string]: string },
}

export type RequestVote = {
	voteFrom: string,
	voteFor: string,
}


const sceneMessageBus = new MessageBus()
export let localPlayer: any

class GameManager {
	utcTimestamp          : number  = 0
	utcTimestampMillis    : number  = 0
	timeSinceLastUTCUpdate: number  = 0

	iAmTheHost            : boolean = false
	iAmInTheGame          : boolean = false
	countdownValue        : number  = 0

	currentTimeout: utils.TimerId | undefined = undefined

	state: GameState = {
		gameState    : GameStatus.IDLE,
		hostUserId   : "",
		players      : [],
		gameStartTime: 0,
		votes        : {},
	}


	constructor() {
		console.log("GameManager constructor")
	}

	ResetState() {
		this.state.gameState     = GameStatus.IDLE
		this.state.hostUserId    = ""
		this.state.players       = []
		this.state.gameStartTime = 0	
		this.state.votes         = {}

		if (this.currentTimeout) {
			utils.timers.clearTimeout(this.currentTimeout)
			this.currentTimeout = undefined
		}

		HideCountdownTimer()
		HideVotingOptions()
		HideVotingResults()
		UpdatePlayerList()
	}

	// MARK: init
	async init() {
		console.log("GameManager Init")

		this.ResetState()
		this.SpawnGameHostNPC()

		this.UpdateUTCTimestamp()
		engine.addSystem((dt) => this.System_UpdateTimers(dt))

		// Ensure we have player data for local player
		localPlayer = await waitForPlayerData()
		if (localPlayer) {
			console.log("GameManager constructor: localPlayer" + localPlayer.userId)
		} else {
			console.log("GameManager constructor: localPlayer not found")
		}

		// MessageBus handling
		// Handle players requesting to join the current game
		sceneMessageBus.on('joinGameRequest', (request: { userId: string }) => {
			this.OnRequestToJoinGame(request.userId)
		})

		// Handle state requests
		sceneMessageBus.on('stateRequest', () => {
			console.log("GameManager: sceneMessageBus: stateRequest")
			this.OnStateRequest()
		})

		// Handle state updates
		sceneMessageBus.on('stateUpdate', (state: GameState) => {
			console.log("GameManager: sceneMessageBus: stateUpdate:", state)
			this.OnStateUpdate(state)
		})

		// Handle players requesting to vote
		sceneMessageBus.on('requestVote', (vote: RequestVote) => {
			console.log("GameManager: sceneMessageBus: requestVote:", vote)
			this.OnRequestVote(vote)
		})

		// Handle players entering the scene
		onEnterScene((player) => {
			if (!player) return

			// Cache the players data
			GetPlayerProfile(player.userId)

			if (player != localPlayer) {
				if (this.iAmTheHost) {
					console.log("GameManager: Player joined:", player.userId)
					this.TriggerStateUpdate()
				}
			} 
				
		})

		onLeaveScene((userId) => {
			if (!userId) return
			console.log("GameManager: Player left:", userId)

			if (userId == this.state.hostUserId) {
				this.OnAbort()
				if (userId == localPlayer?.userId) {
					ShowWarning("You left the game! Game was cancelled")
				} else {
					ShowWarning("The game host has left the game!")	
				}
			}

		})

		// Do a state request to get the current game state
		sceneMessageBus.emit('stateRequest', {})
	}

	// MARK: ---
	// MARK: SpawnGameHostNPC
	SpawnGameHostNPC() {
		const position = Vector3.create(15.0718, 0.4, 28.95)

		// Create the podium
		const podium = engine.addEntity()
		Transform.create(podium, {
			position: position,
			rotation: Quaternion.fromEulerDegrees(0, 0, 0),
			scale: Vector3.create(1, 1, 1)
		})
		GltfContainer.create(podium, {
			src: "assets/models/podium.gltf",
		})
		pointerEventsSystem.onPointerDown(
			{ 
				entity: podium, 
				opts: { 
					button: InputAction.IA_PRIMARY,
					hoverText: "Join/Start Game",
					maxDistance: 10
				} 
			},
			() => {
				console.log("GameManager: OnPointerDown: Join/Start Game")
				if (!localPlayer || !localPlayer.userId) return
				this.JoinOrStartGame(localPlayer.userId)
			}
		)


		// Create the NPC
		const npcHost = engine.addEntity()
		Transform.create(npcHost, {
			position: position,
			rotation: Quaternion.fromEulerDegrees(0, 180, 0),
			scale: Vector3.create(1, 1, 1)
		})

		// Spawn the Avatar
		AvatarShape.create(npcHost, {
			id       : "GH    ",
			name     : "Start a game 👇",
			bodyShape: "urn:decentraland:off-chain:base-avatars:BaseMale",
			wearables: [
				"urn:decentraland:off-chain:base-avatars:slicked_hair",
				"urn:decentraland:off-chain:base-avatars:eyebrows_01",
				"urn:decentraland:off-chain:base-avatars:eyes_09",
				"urn:decentraland:off-chain:base-avatars:mouth_07",
				"urn:decentraland:off-chain:base-avatars:full_beard",
				"urn:decentraland:matic:collections-v2:0x957f821cc9074a65caf17023f5a46a15727039c8:2", // Tophat
				"urn:decentraland:matic:collections-v2:0x1264078e7ac68491bda3f2d6da1a918198132211:0", // suit
				"urn:decentraland:matic:collections-v2:0x75d20f9e05844ad1ecf9b2e239b460e7e2c0fa8a:0", // shoes
			],
			eyeColor : Color3.fromHexString("#D89130"),
			skinColor: Color3.fromHexString("#D89130"),
			hairColor: Color3.fromHexString("#D89130"),
			emotes: []
		})
	}

	// MARK: System_UpdateTimers
	System_UpdateTimers = (dt: number) => {
		// Fetch current UTC time
		this.timeSinceLastUTCUpdate += dt
		this.utcTimestampMillis     += dt * 1000
		this.utcTimestamp           =  Math.floor(this.utcTimestampMillis / 1000)

		if (this.timeSinceLastUTCUpdate >= GameSettings.UTC_UPDATE_INTERVAL) {
			this.timeSinceLastUTCUpdate = 0 // set this here to prevent multiple calls to UpdateUTCTimestamp()
			this.UpdateUTCTimestamp()
		}

		if (this.state.gameState == GameStatus.STARTING) {
			// Calculate countdown value
			let remainingTime   = (this.state.gameStartTime - this.utcTimestamp) % GameSettings.COUNTDOWN_DURATION
			remainingTime       = Math.max(0, remainingTime)
			remainingTime       = Math.floor(remainingTime)
			this.countdownValue = remainingTime
		}
	}

	// MARK: UpdateUTCTimestamp
	UpdateUTCTimestamp() {
		GetUTCTimestampMillis().then((timestampMillis) => {
			if (!timestampMillis) {
				console.error("GameManager: UpdateUTCTimestamp: Failed to get UTC timestamp")
				return
			}
			console.log("UTC updated to:", timestampMillis)
			this.utcTimestamp           = Math.floor(timestampMillis / 1000)
			this.utcTimestampMillis     = timestampMillis
			this.timeSinceLastUTCUpdate = 0
		})
	}


	
	// MARK: ---
	// MARK: JoinOrStartGame
	// When a player presses the button to Start/Join a game
	JoinOrStartGame(userId: string) {
		console.log("GameManager: JoinOrStartGame", userId)

		// Ensure we have a proper UTC time
		if (this.utcTimestamp < 10000) {
			console.log("GameManager: JoinOrStartGame: UTC time not set, waiting for it to be set")
			ShowWarning("Game not ready yet, please wait while we sync the time")
			this.UpdateUTCTimestamp()
			return
		}

		// Ignore if we're already in the list of players
		if (this.state.players.includes(userId)) {
			console.log("GameManager: OnJoinOrStartGame: Player already in the list of players")
			return
		}

		// If game is starting then request to join
		if (this.state.gameState == GameStatus.STARTING) {
			this.RequestToJoinGame()
			return
		} 
		
		// If no game in progress then the player is now the Host
		if (this.state.gameState == GameStatus.IDLE) {
			// TODO: more checks here to ensure there's not currently a game running? perhaps check how many other players are currently in the scene?
			this.StartHostingNewGame()
			return
		}
	}
	
	

	// MARK: ---
	// MARK: RequestToJoinGame
	// When a player presses the button to Join Game
	RequestToJoinGame() {
		if (this.state.gameState != GameStatus.STARTING) {
			console.log("GameManager: RequestToJoinExistingGame: Game not STARTING")
			// TODO: trigger UI popup to notify player that the game is not in the waiting for players state
			return
		} 

		// Ignore if the game is full
		if (this.state.players.length >= GameSettings.MAX_PLAYERS) {
			ShowWarning("The current game is full, please wait for the next game!")
			return
		}

		if (!localPlayer || !localPlayer.userId) return
		sceneMessageBus.emit('joinGameRequest', { userId: localPlayer.userId })
	}

	// MARK: OnRequestToJoinGame
	OnRequestToJoinGame(userId: string) {
		if (!this.iAmTheHost) return
		console.log("GameManager: OnRequestToJoinExistingGame:", userId)

		// Ignore if game is not in the starting state
		if (this.state.gameState != GameStatus.STARTING) {
			console.log("GameManager: OnRequestToJoinExistingGame: Game not STARTING, ignoring request to join")
			return
		} 

		// Ignore if player is already in the list of players
		if (this.state.players.includes(userId)) {
			console.log("GameManager: OnRequestToJoinExistingGame: Player already in the list of players", userId)
			return
		}

		// Ignore if the game is full
		if (this.state.players.length >= GameSettings.MAX_PLAYERS) {
			console.log("GameManager: OnRequestToJoinExistingGame: Max players reached, ignoring request to join")
			this.TriggerStateUpdate() // Push latest state to all clients, as the client whor equests must be missing data
			return
		}

		this.state.players.push(userId)
		this.TriggerStateUpdate()
		UpdatePlayerList()
	}



	// MARK: ---
	// MARK: StartHostingNewGame
	StartHostingNewGame() {
		if (!localPlayer || !localPlayer.userId) {
			console.error("GameManager: StartHostingNewGame: localPlayer not found, or no userID, couldn't become host")
			return
		}
		this.iAmTheHost             = true
		this.iAmInTheGame           = true
		this.state.hostUserId       = localPlayer.userId
		this.state.players          = [localPlayer.userId]
		this.state.gameStartTime = this.utcTimestamp + GameSettings.COUNTDOWN_DURATION

		this.TriggerCountdownStart()
	}
	


	// MARK: ---
	// MARK: TriggerCountdownStart
	TriggerCountdownStart() {
		if (!this.iAmTheHost) return
		console.log("GameManager: TriggerCountdownStart: starting in", this.state.gameStartTime - this.utcTimestamp, "seconds")

		this.state.gameState = GameStatus.STARTING
		this.TriggerStateUpdate()

		this.OnCountdownStart() // Manually trigger this here to apply it to the host

		if (this.currentTimeout) {
			utils.timers.clearTimeout(this.currentTimeout)
		}
		this.currentTimeout = utils.timers.setTimeout(() => {
			if (this.state.gameState == GameStatus.IDLE) return
			this.TriggerRoundStart()
		}, GameSettings.COUNTDOWN_DURATION * 1000)
	}

	// MARK: OnCountdownStart
	OnCountdownStart() {
		console.log("GameManager: OnCountdownStart: starting in", this.state.gameStartTime - this.utcTimestamp, "seconds")
		// The timer now starts automatically. We should pop up a UI to encourage the players to get dressed?
		ShowCountdownTimer()		
		UpdatePlayerList()
	}




	// MARK: ---
	// MARK: TriggerRoundStart
	TriggerRoundStart() {
		if (!this.iAmTheHost) return
		console.log("GameManager: TriggerRoundStart")

		this.state.gameState = GameStatus.ROUND_ACTIVE
		this.TriggerStateUpdate()

		this.OnRoundStart() // Manually trigger this here to apply it to the host

		if (this.currentTimeout) {
			utils.timers.clearTimeout(this.currentTimeout)
		}
		const roundDuration = (GameSettings.ROUND_DURATION_PER_PLAYER * this.state.players.length + GameSettings.ROUND_START_DELAY) * 1000
		this.currentTimeout = utils.timers.setTimeout(() => {
			if (this.state.gameState == GameStatus.IDLE) return
			this.TriggerVotingStart()
		}, roundDuration)
	}


	// MARK: OnRoundStart
	OnRoundStart() {
		if (!this.iAmInTheGame) return
		console.log("GameManager: OnRoundStart")

		HideCountdownTimer()
		this.MovePlayersToArena()

		_StageController.RunShow(this.state.players)
	}



	// MARK: ---
	// MARK: TriggerVoting
	TriggerVotingStart() {
		if (!this.iAmTheHost) return
		console.log("GameManager: TriggerVoting")

		this.state.gameState = GameStatus.VOTING
		this.TriggerStateUpdate()

		this.OnVotingStart()
		
		if (this.currentTimeout) {
			utils.timers.clearTimeout(this.currentTimeout)
		}
		this.currentTimeout = utils.timers.setTimeout(() => {
			if (this.state.gameState == GameStatus.IDLE) return
			this.TriggerVotingEnd()
		}, GameSettings.VOTING_DURATION * 1000)
	}

	// MARK: OnVotingStart
	OnVotingStart() {
		// Ignore if we are not in the game
		if (!this.iAmInTheGame) return
		console.log("GameManager: OnVotingStart")

		ShowVotingOptions()
	}

	
	// MARK: ---
	// MARK: OnRequestVote
	OnRequestVote(vote: RequestVote) {
		// Ignore if we are not the host
		if (!this.iAmTheHost) return

		// Ignore if we're not in the voting stage
		if (this.state.gameState != GameStatus.VOTING) {
			console.log("GameManager: OnRequestVote: Not in the voting stage")
			return
		}

		console.log("GameManager: OnRequestVote:", vote)

		// Ignore if the player is not in the list of players
		if (!this.state.players.includes(vote.voteFrom)) {
			console.log("GameManager: OnRequestVote: Player not in the list of players", vote.voteFrom)
			return
		}
		// Ignore if the player is not in the list of players
		if (!this.state.players.includes(vote.voteFor)) {
			console.log("GameManager: OnRequestVote: Player not in the list of players", vote.voteFor)
			return
		}

		this.state.votes[vote.voteFrom] = vote.voteFor
		this.TriggerStateUpdate()
	}



	// MARK: ---
	// MARK: TriggerVotingEnd
	TriggerVotingEnd() {
		if (!this.iAmTheHost) return
		console.log("GameManager: TriggerVotingEnd")

		this.state.gameState = GameStatus.GAME_ENDED
		this.TriggerStateUpdate()

		this.OnVotingEnd()

		if (this.currentTimeout) {
			utils.timers.clearTimeout(this.currentTimeout)
		}
		this.currentTimeout = utils.timers.setTimeout(() => {
			if (this.state.gameState == GameStatus.IDLE) return
			this.TriggerIdle()
		}, GameSettings.GAME_ENDED_DURATION * 1000)
	}

	// MARK: OnVotingEnd
	OnVotingEnd() {
		// Ignore if we are not in the game
		if (!this.iAmInTheGame) return
		
		console.log("GameManager: OnVotingEnd")
		ShowVotingResults()

		_SeatManager.MovePlayerToLobby()

	}



	// MARK: ---
	// MARK: TriggerIdle
	TriggerIdle() {
		if (!this.iAmTheHost) return
		console.log("GameManager: TriggerIdle")

		this.ResetState()
		this.TriggerStateUpdate()

		this.OnIdle()
	}

	// MARK: OnIdle
	OnIdle() {
		console.log("GameManager: OnIdle")
		this.ResetState()
	}


	// MARK: OnAbort
	OnAbort() {
		console.log("GameManager: OnAbort")

		// Clear any existing timers
		if (this.currentTimeout) {
			utils.timers.clearTimeout(this.currentTimeout)
		}

		// Reset our gamestate
		this.ResetState()

		// Move everyone back to the lobby
		_SeatManager.MovePlayerToLobby()

		// Let the stage controller know that the game has ended
		_StageController.Abort()
	}


	// MARK: ---
	// MARK: OnStateRequest
	OnStateRequest() {
		console.log("GameManager: OnStateRequest")
		if (this.iAmTheHost) {
			this.TriggerStateUpdate()
		}
	}

	// MARK: TriggerStateUpdate
	TriggerStateUpdate() {
		if (!this.iAmTheHost) return
		console.log("GameManager: SendStateToAllClients")
		sceneMessageBus.emit('stateUpdate', this.state)
	}

	// MARK: OnStateUpdate
	OnStateUpdate(newState: GameState) {
		console.log("GameManager: OnStateUpdate:", newState)

		// Ignore if we don't have localPlayer data - eg after a player joins the scene while we're still loading
		if (!localPlayer || !localPlayer.userId) return

		// Ensure data for all players in the game is cached
		for (const player of newState.players) {
			GetPlayerProfile(player)
		}

		// Ignore updates if we are the host
		if (this.iAmTheHost && newState.hostUserId !== localPlayer!.userId) {
			console.log("GameManager: OnStateUpdate: Problem, another player thinks they are the host!")
			return
		}
		if (this.iAmTheHost) return

		// Store the state, then update it
		const lastGameState = this.state.gameState
		this.state = newState

		// Check if we are in the game
		this.iAmInTheGame = this.state.players.includes(localPlayer!.userId)

		if (this.state.gameState != lastGameState) {
			switch (this.state.gameState) {
				case GameStatus.STARTING:
					this.OnCountdownStart()
					break
				case GameStatus.ROUND_ACTIVE:
					this.OnRoundStart()
					break
				case GameStatus.VOTING:
					this.OnVotingStart()
					break
				case GameStatus.GAME_ENDED:
					this.OnVotingEnd()
					break
				case GameStatus.IDLE:
					this.OnIdle()
					break
			}
		}
		UpdatePlayerList()
	}
	
	// MARK: ---
	// MARK: Utils
	MovePlayersToArena() {
		if (!localPlayer || !localPlayer.userId) return
		const playerIndex = this.state.players.indexOf(localPlayer.userId)
		_SeatManager.MovePlayerToSeat(playerIndex)
	}


}

export const _GameManager = new GameManager()
