import { engine, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { MessageBus } from "@dcl/sdk/message-bus"
import { onEnterScene } from "@dcl/sdk/players"
import { GetPlayerProfile, GetUTCTimestampMillis, waitForPlayerData } from "./utils"
import { HideCountdownTimer, ShowCountdownTimer, ShowVoting, ShowVotingResults, UpdatePlayerList } from "./ui.Game"
import { movePlayerTo } from "~system/RestrictedActions"

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

const GAMESETTINGS = {
	COUNTDOWN_DURATION       : 6,
	ROUND_DURATION_PER_PLAYER: 6,
	VOTING_DURATION          : 10,
	GAME_ENDED_DURATION      : 10,
	UTC_UPDATE_INTERVAL      : 15
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

	state: any = {
		gameState    : GameStatus.IDLE,
		hostUserId   : 0,
		players      : [],
		gameStartTime: 0,
	}


	constructor() {
		console.log("GameManager constructor")
	}

	// MARK: init
	async init() {
		console.log("GameManager Init")

		this.FetchUTCTimestamp()

		// Ensure we have player data for local player
		localPlayer = await waitForPlayerData()
		if (localPlayer) {
			console.log("GameManager constructor: localPlayer" + localPlayer.userId)
		} else {
			console.log("GameManager constructor: localPlayer not found")
		}

		// Handle state requests
		sceneMessageBus.on('stateRequest', () => {
			console.log("GameManager: sceneMessageBug: stateRequest")
			this.OnStateRequest()
		})

		sceneMessageBus.on('stateUpdate', (state: GameState) => {
			console.log("GameManager: sceneMessageBus: stateUpdate:", state)
			this.OnStateUpdate(state)
		})

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

		// Handle players requesting to join the current game
		sceneMessageBus.on('joinGameRequest', (request: { userId: string }) => {
			this.OnRequestToJoinGame(request.userId)
		})

		// Spawn the "Join/start" trigger
		const joinStartTrigger = engine.addEntity()
		Transform.create(joinStartTrigger, {
			position: Vector3.create(16, 1, 22),
			rotation: Quaternion.fromEulerDegrees(0, 0, 0),
			scale: Vector3.create(1, 1, 1)
		})
		MeshRenderer.setBox(joinStartTrigger)
		MeshCollider.setBox(joinStartTrigger)
		pointerEventsSystem.onPointerDown(
			{ 
				entity: joinStartTrigger, 
				opts: { 
					button: InputAction.IA_PRIMARY,
					hoverText: "Join/Start Game",
					maxDistance: 10
				} 
			},
			() => {
				console.log("GameManager: OnPointerDown: Join/Start Game")
				this.JoinOrStartGame(localPlayer!.userId)
			}
		)

		// Do a state request to get the current game state
		sceneMessageBus.emit('stateRequest', {})

		engine.addSystem((dt) => this.System_UpdateTimers(dt))


		// DEBUG STUFF
		//ShowVoting()
		ShowCountdownTimer()
		utils.timers.setTimeout(() => {
			//ShowVotingResults()
		}, 500)
	}




	// MARK: System_UpdateTimers
	System_UpdateTimers = (dt: number) => {
		// Fetch current UTC time
		this.timeSinceLastUTCUpdate += dt
		this.utcTimestampMillis     += dt * 1000
		this.utcTimestamp           =  Math.floor(this.utcTimestampMillis / 1000)

		if (this.timeSinceLastUTCUpdate >= GAMESETTINGS.UTC_UPDATE_INTERVAL) {
			this.timeSinceLastUTCUpdate = 0 // set this here to prevent multiple calls to FetchUTCTimestamp()
			this.FetchUTCTimestamp()
		}

		if (this.state.gameState == GameStatus.STARTING) {
			// Calculate countdown value
			this.countdownValue = Math.floor(this.state.gameStartTime - this.utcTimestamp)
		}
	}

	// MARK: FetchUTCTimestamp
	FetchUTCTimestamp() {
		GetUTCTimestampMillis().then((timestampMillis) => {
			if (!timestampMillis) {
				console.error("GameManager: FetchUTCTimestamp: Failed to get UTC timestamp")
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

		// Ignore if we're already in the list of players
		if (this.state.players.includes(userId)) {
			console.log("GameManager: OnJoinOrStartGame: Player already in the list of players")
			return
		}

		// If game is starting then request to join
		if (this.state.gameState == GameStatus.STARTING) {
			this.RequestToJoinGame()
		}

		// If no game in progress then the player is now the Host
		if (this.state.gameState == GameStatus.IDLE) {
			// TODO: more checks here to ensure there's not currently a game running? perhaps check how many other players are currently in the scene?
			this.StartHostingNewGame()
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

		sceneMessageBus.emit('joinGameRequest', { userId: localPlayer!.userId })
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
		this.state.hostUserId       = localPlayer!.userId
		this.state.players          = [localPlayer?.userId]
		this.state.gameStartTime = this.utcTimestamp + GAMESETTINGS.COUNTDOWN_DURATION

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

		utils.timers.setTimeout(() => {
			this.TriggerRoundStart()
		}, GAMESETTINGS.COUNTDOWN_DURATION * 1000)
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

		const roundDuration = GAMESETTINGS.ROUND_DURATION_PER_PLAYER * 1000 * this.state.players.length
		utils.timers.setTimeout(() => {
			this.TriggerVoting()
		}, roundDuration)
	}


	// MARK: OnRoundStart
	OnRoundStart() {
		if (!this.iAmInTheGame) return
		console.log("GameManager: OnRoundStart")

		HideCountdownTimer()
		this.MovePlayersToArena()


		// Now we need to:
		// 1. Spawn a camera
		// 2. Loop through each of the players
			// 1. Spawn an NPC representing the player
			// 2. Walk that NPC down the catwalk
			// 3. Have that NPC react to emotes performed by the player it represents
		// 3. Once all the NPCs have walked down the catwalk, the voting UI will show

	}



	// MARK: ---
	// MARK: TriggerVoting
	TriggerVoting() {
		if (!this.iAmTheHost) return
		console.log("GameManager: TriggerVoting")

		this.state.gameState = GameStatus.VOTING
		this.TriggerStateUpdate()

		this.OnVotingStart()

		utils.timers.setTimeout(() => {
			this.TriggerGameEnd()
		}, GAMESETTINGS.VOTING_DURATION * 1000)
	}

	// MARK: OnVotingStart
	OnVotingStart() {
		// Ignore if we are not in the game
		if (!this.iAmInTheGame) return
		console.log("GameManager: OnVotingStart")

		// The voting UI will show here
		ShowVoting()
	}



	// MARK: ---
	// MARK: TriggerGameEnd
	TriggerGameEnd() {
		if (!this.iAmTheHost) return
		console.log("GameManager: TriggerGameEnd")

		this.state.gameState = GameStatus.GAME_ENDED
		this.TriggerStateUpdate()

		this.OnGameEnd()

		utils.timers.setTimeout(() => {
			this.TriggerIdle()
		}, GAMESETTINGS.GAME_ENDED_DURATION * 1000)
	}

	// MARK: OnGameEnd
	OnGameEnd() {
		console.log("GameManager: OnRoundEnd")

		this.MovePlayersToLobby()

		ShowVotingResults()
	}



	// MARK: ---
	// MARK: TriggerIdle
	TriggerIdle() {
		if (!this.iAmTheHost) return
		console.log("GameManager: TriggerIdle")

		this.state.gameState = GameStatus.IDLE
		this.state.hostUserId = ""
		this.state.players = []
		this.state.gameStartTime = 0
		this.TriggerStateUpdate()

		this.OnIdle()
	}

	// MARK: OnIdle
	OnIdle() {
		console.log("GameManager: OnIdle")

		this.iAmTheHost = false
		this.iAmInTheGame = false
		this.TriggerStateUpdate()
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
		const lastState = this.state
		this.state = newState

		// Check if we are in the game
		this.iAmInTheGame = this.state.players.includes(localPlayer!.userId)

		if (this.state.gameState != lastState.gameState) {
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
					this.OnGameEnd()
					break
				case GameStatus.IDLE:
					this.OnIdle()
					break
			}
		}
		UpdatePlayerList()
	}

	// MARK: ---
	// MARK: OnRequestVote
	OnRequestVote(vote: RequestVote) {
		if (!this.iAmInTheGame) return
		console.log("GameManager: OnRequestVote:", vote)

		this.state.votes[vote.voteFrom] = vote.voteFor
		this.TriggerStateUpdate()
		// TODO: implement this	
	}
	
	// MARK: ---
	// MARK: Utils
	MovePlayersToArena() {
		movePlayerTo({newRelativePosition:Vector3.create(16, 6, 20)})

	}

	MovePlayersToLobby() {
		movePlayerTo({newRelativePosition:Vector3.create(16, 0, 20)})
	}

}

export const _GameManager = new GameManager()
