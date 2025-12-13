import { engine, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { MessageBus } from "@dcl/sdk/message-bus"
import { getPlayer, onEnterScene } from "@dcl/sdk/players"
import { GetUTCTimestamp, GetUTCTimestampMillis, waitForPlayerData } from "./utils"
import { UpdatePlayerList } from "./ui.Game"
import { movePlayerTo } from "~system/RestrictedActions"


const GAMESETTINGS = {
	ROUND_START_COUNTDOWN: 10,
	UTC_UPDATE_INTERVAL: 5
}

const sceneMessageBus = new MessageBus()
export let localPlayer: any

export enum GameStatus {
	IDLE         = "IDLE",
	STARTING     = "STARTING",
	ROUND_ACTIVE = "ROUND_ACTIVE",
	VOTING       = "VOTING",
}

export type GameState = {
	gameState       : GameStatus,
	gameId          : string,
	hostPlayerId    : string,
	players         : string[],
	countdownEndTime: number,
	countdownTimeElapsed: number,
}

class GameManager {

	IAmTheHost: boolean = false

	state: any = {
		gameState       : GameStatus.IDLE,
		hostPlayerId    : 0,
		players         : [],
		countdownEndTime: 0,
	}

	utcTimestamp            : number = 0
	utcTimestampMillis      : number = 0
	timeSinceLastUTCUpdate: number = 0
	countdownValue        : number = 0

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

		// Handle players entering the scene
		onEnterScene((player) => {
			if (!player) return
			if (player != localPlayer) {
				if (this.IAmTheHost) {
					console.log("GameManager: Player joined:", player.userId)
					this.SendStateToAllClients()
				}
			} 
				
		})

		// Handle players requesting to join the current game
		sceneMessageBus.on('joinGameRequest', (request: { userId: string }) => {
			this.OnRequestToJoinExistingGame(request.userId)
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
					maxDistance: this.state.gameState == GameStatus.IDLE ? 10 : 0
				} 
			},
			() => {
				console.log("GameManager: OnPointerDown: Join/Start Game")
				this.OnJoinOrStartGame(localPlayer!.userId)
			}
		)

		// Do a state request to get the current game state
		sceneMessageBus.emit('stateRequest', {})

		engine.addSystem((dt) => this.System_UpdateTimers(dt))
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
			this.countdownValue = Math.floor(this.state.countdownEndTime - this.utcTimestamp)

			// Check if countdown has reached 0
			if (this.countdownValue <= 0 && this.IAmTheHost) {
				this.OnRoundStart()
			}
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

	// MARK: OnJoinOrStartGame
	// When a player presses the button to Start/Join a game
	OnJoinOrStartGame(playerId: string) {
		console.log("GameManager: JoinOrStartGame", playerId)

		// Ignore if we're already in the list of players
		if (this.state.players.includes(playerId)) {
			console.log("GameManager: OnJoinOrStartGame: Player already in the list of players")
			return
		}

		// If game is starting then request to join
		if (this.state.gameState == GameStatus.STARTING) {
			this.RequestToJoinExistingGame()
		}

		// If no game in progress then the player is now the Host
		if (this.state.gameState == GameStatus.IDLE) {
			this.OnStartNewGame()
		}
	}
	
	// MARK: OnStartNewGame
	async OnStartNewGame() {
		this.IAmTheHost         = true
		this.state.gameState    = GameStatus.STARTING
		this.state.hostPlayerId = localPlayer!.userId
		this.state.players      = [localPlayer?.userId]
		this.state.countdownEndTime = this.utcTimestamp + GAMESETTINGS.ROUND_START_COUNTDOWN
		this.SendStateToAllClients()
		UpdatePlayerList()
	}
	
	// MARK: RequestToJoinExistingGame
	// When a player presses the button to Join Game
	RequestToJoinExistingGame() {
		if (this.state.gameState != GameStatus.STARTING) {
			console.log("GameManager: RequestToJoinExistingGame: Game not STARTING")
			// TODO: trigger UI popup to notify player that the game is not in the waiting for players state
			return
		} 

		sceneMessageBus.emit('joinGameRequest', { userId: localPlayer!.userId })
	}

	// MARK: OnRequestToJoinExistingGame
	OnRequestToJoinExistingGame(userId: string) {
		if (!this.IAmTheHost) return
		console.log("GameManager: OnRequestToJoinExistingGame:", userId)

		if (this.state.gameState != GameStatus.STARTING) {
			console.log("GameManager: OnRequestToJoinExistingGame: Game not STARTING")
			// TODO: trigger UI popup to notify player that the game is not in the waiting for players state
			return
		} 

		this.state.players.push(userId)
		this.SendStateToAllClients()
		UpdatePlayerList()
	}

	// MARK: OnCountdownStart
	OnCountdownStart() {
		console.log("GameManager: OnCountdownStart")

	}

	// MARK: OnRoundStart
	OnRoundStart() {
		console.log("GameManager: OnRoundStart")
		this.state.gameState = GameStatus.ROUND_ACTIVE
		this.state.countdownEndTime = 0
		this.state.countdownTimeElapsed = 0
		this.countdownValue = 0
		this.SendStateToAllClients()

		this.MovePlayersToArena()
	}

	// MARK: OnRoundEnd
	OnRoundEnd() {
		console.log("GameManager: OnRoundEnd")

		this.IAmTheHost = false
		this.state.gameState = GameStatus.IDLE
		this.state.hostPlayerId = ""
		this.state.players = []
		this.SendStateToAllClients()

		this.MovePlayersToLobby()
	}

	// MARK: OnStateRequest
	OnStateRequest() {
		console.log("GameManager: OnStateRequest")
		if (this.IAmTheHost) {
			this.SendStateToAllClients()
		}
	}

	// MARK: OnStateUpdate
	OnStateUpdate(state: GameState) {
		console.log("GameManager: OnStateUpdate:", state)

		// Ignore updates if we are the host
		if (this.IAmTheHost && state.hostPlayerId !== localPlayer!.userId) {
			console.log("GameManager: OnStateUpdate: Problem, another player thinks they are the host!")
			return
		}
		if (this.IAmTheHost) {
			return
		}
		this.state = state
		UpdatePlayerList()
	}


	// MARK: SendStateToAllClients
	SendStateToAllClients() {
		if (!this.IAmTheHost) return
		console.log("GameManager: SendStateToAllClients")
		sceneMessageBus.emit('stateUpdate', this.state)
	}

	MovePlayersToArena() {
		movePlayerTo({newRelativePosition:Vector3.create(16, 6, 20)})

	}

	MovePlayersToLobby() {
		movePlayerTo({newRelativePosition:Vector3.create(16, 0, 20)})
	}

}

export const _GameManager = new GameManager()
