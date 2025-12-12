import { engine, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { MessageBus } from "@dcl/sdk/message-bus"
import { getPlayer, onEnterScene } from "@dcl/sdk/players"
import { waitForPlayerData } from "./utils"


const sceneMessageBus = new MessageBus()
let localPlayer: any

enum GameStatus {
	IDLE         = "IDLE",
	STARTING     = "STARTING",
	ROUND_ACTIVE = "ROUND_ACTIVE",
	VOTING       = "VOTING",
}

type GameState = {
	gameState       : GameStatus,
	gameId          : string,
	hostPlayerId    : string,
	players         : string[],
	countdownEndTime: number,
	roundStartTime  : number,
	npcsSpawned     : number,
}

class GameManager {

	IAmTheHost: boolean = false

	state: any = {
		gameState       : GameStatus.IDLE,
		hostPlayerId    : 0,
		players         : [],
		countdownEndTime: 0,
		roundStartTime  : 0
	}

	constructor() {
		console.log("GameManager constructor")
	}

	async init() {
		console.log("GameManager Init")

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
					hoverText: "Join/Start Game"
				} 
			},
			() => {
				console.log("GameManager: OnPointerDown: Join/Start Game")
				this.OnJoinOrStartGame(localPlayer!.userId)
			}
		)

		// Do a state request to get the current game state
		sceneMessageBus.emit('stateRequest', {})
	}

	// When a player presses the button to Start/Join a game
	OnJoinOrStartGame(playerId: string) {
		console.log("GameManager: JoinOrStartGame", playerId)
		// If no game in progress then the player is now the Host
		if (this.state.gameState == GameStatus.IDLE) {
			this.OnStartNewGame()
		}

		// If we are starting the game
		if (this.state.gameState == GameStatus.STARTING) {
			this.RequestToJoinExistingGame()
		}
	}
	
	OnStartNewGame() {
		this.IAmTheHost         = true
		this.state.gameState    = GameStatus.STARTING
		this.state.hostPlayerId = localPlayer!.userId
		this.state.players      = [localPlayer!.userId]
		this.SendStateToAllClients()
	}
	
	// When a player presses the button to Join Game
	RequestToJoinExistingGame() {
		if (this.state.gameState != GameStatus.STARTING) {
			console.log("GameManager: RequestToJoinExistingGame: Game not STARTING")
			// TODO: trigger UI popup to notify player that the game is not in the waiting for players state
			return
		} 

		sceneMessageBus.emit('joinGameRequest', { userId: localPlayer!.userId })
	}

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
	}

	OnGameOver() {
		this.IAmTheHost = false
		this.state.gameState = GameStatus.IDLE
		this.state.hostPlayerId = ""
		this.state.players = []
		this.SendStateToAllClients()
	}

	OnStateRequest() {
		console.log("GameManager: OnStateRequest")
		if (this.IAmTheHost) {
			this.SendStateToAllClients()
		}
	}

	OnStateUpdate(state: GameState) {
		console.log("GameManager: OnStateUpdate:", state)

		// Ignore updates if we are the host
		if (this.IAmTheHost) {
			return
		}
		this.state = state
	}


	SendStateToAllClients() {
		console.log("GameManager: SendStateToAllClients")
		sceneMessageBus.emit('stateUpdate', this.state)
	}
}

export const _GameManager = new GameManager()
