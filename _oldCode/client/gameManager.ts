import { AvatarShape, engine, GltfContainer, InputAction, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { getPlayer, onEnterScene, onLeaveScene } from "@dcl/sdk/players"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"
import { MessageBus } from "@dcl/sdk/message-bus"

import * as utils from '@dcl-sdk/utils'

import { GameSettings } from "../shared/settings"
import { StageController } from "./stageController"
import { SeatManager } from "./SeatManager"
import { CameraController } from "./cameraController"
import { OutfitManager } from "./outfitManager"

import { UpdatePlayerList } from "./ui/ui.game.playerList"
import { ShowWarning } from "./ui/ui.game.warning"
import { HideCountdownTimer, ShowCountdownTimer } from "./ui/ui.game.countdownTimer"
import { HideVotingOptions, ShowVotingOptions } from "./ui/ui.game.votingOptions"
import { HideVotingResults, ShowVotingResults } from "./ui/ui.game.votingResults"
import { Outfit } from "src/_oldCode/shared/types"


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
	timestamp    : number,
	outfits      : Outfit[],
}

export type RequestVote = {
	voteFrom: string,
	voteFor : string,
}


const sceneMessageBus = new MessageBus()
export let localPlayer: any

export namespace GameManager {
	export let utcTimestamp          : number  = 0
	export let utcTimestampMillis    : number  = 0
	export let timeSinceLastUTCUpdate: number  = 0

	export let iAmTheHost            : boolean = false
	export let iAmInTheGame          : boolean = false
	export let countdownValue        : number  = 0

	let currentTimeout: utils.TimerId | undefined = undefined // used to start the countdown
	let timerInterval: utils.TimerId | undefined = undefined // used to send out repeated updates during the countdown

	export let state: GameState = {
		gameState    : GameStatus.IDLE,
		hostUserId   : "",
		players      : [],
		gameStartTime: 0,
		votes        : {},
		timestamp    : 0,
		outfits      : [],
	}


	// MARK: ResetState
	function ResetState() {
		state.gameState     = GameStatus.IDLE
		state.hostUserId    = ""
		state.players       = []
		state.gameStartTime = 0	
		state.votes         = {}
		state.timestamp     = 0
		state.outfits       = []
		if (currentTimeout) {
			utils.timers.clearTimeout(currentTimeout)
			currentTimeout = undefined
		}
		if (timerInterval) {
			utils.timers.clearInterval(timerInterval)
			timerInterval = undefined
		}

		HideCountdownTimer()
		HideVotingOptions()
		HideVotingResults()
		UpdatePlayerList()
	}


	// MARK: init
	export async function init() {
		console.log("GameManager Init")

		ResetState()
		SpawnGameHostNPC()

		UpdateUTCTimestamp()
		engine.addSystem((dt) => System_UpdateTimers(dt))

		// Ensure we have player data for local player
		utils.timers.setTimeout(() => {
			localPlayer = getPlayer()
			if (!localPlayer) {
				console.error("GameManager: init(): localPlayer not found")
			}
		}, 2000)


		// MessageBus handling
		// Handle players requesting to join the current game
		sceneMessageBus.on(MessageBusEvents.REQUEST_JOIN_GAME, (outfit: Outfit) => {
			OnRequestToJoinGame(outfit)
		})

		// Handle state requests
		sceneMessageBus.on(MessageBusEvents.REQUEST_STATE, () => {
			//console.log("GameManager: sceneMessageBus: stateRequest")
			OnStateRequest()
		})

		// Handle state updates
		sceneMessageBus.on(MessageBusEvents.NOTIFY_CLIENT_STATE, (state: GameState) => {
			//console.log("GameManager: sceneMessageBus: stateUpdate:", state)
			OnStateUpdate(state)
		})

		// Handle outfit updates
		sceneMessageBus.on(MessageBusEvents.NOTIFY_SERVER_OUTFIT, (outfit: Outfit) => {
			//console.log("GameManager: sceneMessageBus: outfitUpdate:", outfit)
			OnNotifyUpdateOutfit(outfit)
		})

		// Handle players requesting to vote
		sceneMessageBus.on(MessageBusEvents.NOTIFY_SERVER_VOTE, (vote: RequestVote) => {
			//console.log("GameManager: sceneMessageBus: requestVote:", vote)
			OnRequestVote(vote)
		})

		// Handle players entering the scene
		onEnterScene((player) => {
			if (!player) return


			if (player != localPlayer) {
				if (iAmTheHost) {
					console.log("GameManager: Player joined:", player.userId)
					TriggerStateUpdate()
				}
			} 
		})

		onLeaveScene((userId) => {
			if (!userId) return
			console.log("GameManager: Player left:", userId)

			if (userId == state.hostUserId) {
				OnAbort()
				if (userId == localPlayer?.userId) {
					ShowWarning("You left the game! Game was cancelled")
				} else {
					ShowWarning("The game host has left the game!")	
				}
			}

		})

		// Do a state request to get the current game state
		sceneMessageBus.emit(MessageBusEvents.REQUEST_STATE, {})
	}

	// MARK: ---
	// MARK: SpawnGameHostNPC
	/* function SpawnGameHostNPC() {
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
					button: InputAction.IA_POINTER,
					hoverText: "Join/Start Game",
					maxDistance: 10
				} 
			},
			() => {
				JoinOrStartGame()
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
			bodyShape: "urn:decentraland:off-chain:base-avatars:BaseFemale",
			wearables: [
				"urn:decentraland:matic:collections-v2:0x257fe095f35877587dcd29431e3008b3a8fe7c1c:0", // head
				"urn:decentraland:matic:collections-v2:0xcce34685b5bb894c5bb2246728e8f85b0dbb6a43:0", // hair
				"urn:decentraland:matic:collections-v2:0x11c59ac0a8a4c3f92b40433a540615191588b6e9:0", // necklace
				"urn:decentraland:matic:collections-v2:0x9ef30e8babfd367e2f31f3374ffe35ff4862e914:0", // dress
				"urn:decentraland:matic:collections-v2:0x5a22a1d25d6f7c2d46903156db56d479f5b9d1e4:0", // shoes
				"urn:decentraland:matic:collections-v2:0xd70a2c52cfb19403bcbf6e59a26364b30a853477:0", // aura
				"urn:decentraland:matic:collections-v2:0x9d25f6b3080ce522e807ab6038a7f7b9c5e83110:0", // hands
				"urn:decentraland:matic:collections-v2:0xb249ea4a94198ccfd27cfef97b1d797d03a84910:0", // earrings
			],
			eyeColor : Color3.fromHexString("#d83030"),
			skinColor: Color3.fromHexString("#CC9B77"),
			hairColor: Color3.fromHexString("#ebebeb"),
			emotes: []
			
		})
	} */


	// MARK: System_UpdateTimers
	const System_UpdateTimers = (dt: number) => {
		// Fetch current UTC time
		timeSinceLastUTCUpdate += dt
		utcTimestampMillis     += dt * 1000
		utcTimestamp           =  Math.floor(utcTimestampMillis / 1000)

		if (timeSinceLastUTCUpdate >= GameSettings.UTC_UPDATE_INTERVAL) {
			timeSinceLastUTCUpdate = 0 // set this here to prevent multiple calls to UpdateUTCTimestamp()
			UpdateUTCTimestamp()
		}

		if (state.gameState == GameStatus.STARTING) {
			// Calculate countdown value
			let remainingTime   = (state.gameStartTime - utcTimestamp) % (GameSettings.COUNTDOWN_DURATION + 1)
			remainingTime       = Math.max(0, remainingTime)
			remainingTime       = Math.floor(remainingTime)
			countdownValue = remainingTime
		}
	}


	// MARK: UpdateUTCTimestamp
	function UpdateUTCTimestamp() {
		const timestamp = Date.now()
		
		console.log("UTC updated to:", timestamp)
		utcTimestamp           = Math.floor(timestamp / 1000)
		utcTimestampMillis     = timestamp
		timeSinceLastUTCUpdate = 0

		// Old code here, when we were using an external API for the timestamp
/* 		GetUTCTimestampMillis().then((timestampMillis) => {
			if (!timestampMillis) {
				console.error("GameManager: UpdateUTCTimestamp: Failed to get UTC timestamp")
				return
			}
			console.log("UTC updated to:", timestampMillis)
			utcTimestamp           = Math.floor(timestampMillis / 1000)
			utcTimestampMillis     = timestampMillis
			timeSinceLastUTCUpdate = 0
		}) */
	}


	// MARK: ---
	// MARK: JoinOrStartGame
	// When a player presses the button to Start/Join a game
	function JoinOrStartGame() {
		if (!localPlayer || !localPlayer.userId) {
			localPlayer = getPlayer()
			if (!localPlayer || !localPlayer.userId) {
				console.error("GameManager: JoinOrStartGame: localPlayer not found")
				return
			}
		}
		console.log("GameManager: JoinOrStartGame: userId", localPlayer.userId)

		// Ensure we have a proper UTC time
		if (utcTimestamp < 10000) {
			console.log("GameManager: JoinOrStartGame: UTC time not set, waiting for it to be set")
			ShowWarning("Game not ready yet, please wait while we sync the time")
			UpdateUTCTimestamp()
			return
		}

		// Ignore if we're already in the list of players
		if (state.players.includes(localPlayer.userId)) {
			console.log("GameManager: OnJoinOrStartGame: Player already in the list of players")
			ShowWarning("You are already in the game, please wait for it to start")
			return
		}

		// Ignore if a game is in progress
		if (state.gameState == GameStatus.ROUND_ACTIVE || state.gameState == GameStatus.VOTING || state.gameState == GameStatus.GAME_ENDED) {
			console.log("GameManager: OnJoinOrStartGame: Game is in progress, can't join")
			ShowWarning("A Game is currently in progress, please wait for the next game!")
			return
		}

		// Ignore if the game is full
		if (state.players.length >= GameSettings.MAX_PLAYERS) {
			console.log("GameManager: OnJoinOrStartGame: Max players reached, can't join")
			ShowWarning("The current game is full, please wait for the next game!")
			return
		}

		// If game is starting then request to join
		if (state.gameState == GameStatus.STARTING) {
			RequestToJoinGame()
			return
		} 
		
		// If no game in progress then the player is now the Host
		if (state.gameState == GameStatus.IDLE) {
			// TODO: more checks here to ensure there's not currently a game running? perhaps check how many other players are currently in the scene?
			StartHostingNewGame()
			return
		}
	}
	

	// MARK: ---
	// MARK: RequestToJoinGame
	// When a player presses the button to Join Game
	function RequestToJoinGame() {
		if (state.gameState != GameStatus.STARTING) {
			console.log("GameManager: RequestToJoinExistingGame: Game not STARTING")
			// TODO: trigger UI popup to notify player that the game is not in the waiting for players state
			return
		} 

		// Ignore if the game is full
		if (state.players.length >= GameSettings.MAX_PLAYERS) {
			ShowWarning("The current game is full, please wait for the next game!")
			return
		}

		if (!localPlayer || !localPlayer.userId) return
		sceneMessageBus.emit(MessageBusEvents.REQUEST_JOIN_GAME, OutfitManager.GetCurrentOutfit())
	}


	// MARK: OnRequestToJoinGame
	function OnRequestToJoinGame(outfit: Outfit) {
		if (!iAmTheHost) return
		console.log("GameManager: OnRequestToJoinExistingGame:", outfit.userId)

		// Ignore if game is not in the starting state
		if (state.gameState != GameStatus.STARTING) {
			console.log("GameManager: OnRequestToJoinExistingGame: Game not STARTING, ignoring request to join")
			return
		} 

		// Ignore if player is already in the list of players
		if (state.players.includes(outfit.userId)) {
			console.log("GameManager: OnRequestToJoinExistingGame: Player already in the list of players", outfit.userId)
			return
		}

		// Ignore if the game is full
		if (state.players.length >= GameSettings.MAX_PLAYERS) {
			console.log("GameManager: OnRequestToJoinExistingGame: Max players reached, ignoring request to join")
			TriggerStateUpdate() // Push latest state to all clients, as the client whor equests must be missing data
			return
		}

		state.players.push(outfit.userId)
		state.outfits.push(outfit)

		TriggerStateUpdate()
		UpdatePlayerList()
	}

	
	// MARK: OnNotifyUpdateOutfit
	function OnNotifyUpdateOutfit(outfit: Outfit) {
	
		if (!iAmTheHost) return
		console.log("GameManager: OnNotifyUpdateOutfit():", outfit.userId, outfit.wearables.length, "wearables", outfit.bodyShape, Color3.toHexString(outfit.hairColor), Color3.toHexString(outfit.skinColor))

		// get the current outfit for the user, if it exists, update it
		let currentOutfit = state.outfits.find((o) => o.userId === outfit.userId)
		if (currentOutfit) {
			currentOutfit.userId    = outfit.userId
			currentOutfit.wearables = outfit.wearables
			currentOutfit.bodyShape = outfit.bodyShape
			currentOutfit.hairColor = outfit.hairColor
		} else {
			state.outfits.push(outfit)
		}

		TriggerStateUpdate()
	}


	// MARK: ---
	// MARK: StartHostingNewGame
	function StartHostingNewGame() {
		console.log("GameManager: StartHostingNewGame")
		if (!localPlayer || !localPlayer.userId) {
			localPlayer = getPlayer()
			console.error("GameManager: StartHostingNewGame: localPlayer not found, or no userID, couldn't become host")
			return
		}
		iAmTheHost          = true
		iAmInTheGame        = true
		state.hostUserId    = localPlayer.userId
		state.gameStartTime = utcTimestamp + GameSettings.COUNTDOWN_DURATION
		state.players       = [localPlayer.userId]
		state.outfits       = [OutfitManager.GetCurrentOutfit()]

		TriggerCountdownStart()

		// Send out repeated updates during the countdown
		if (timerInterval) utils.timers.clearInterval(timerInterval)
		timerInterval = utils.timers.setInterval(() => {
			TriggerStateUpdate()
		}, 1000)

		utils.timers.setTimeout(() => {
			if (timerInterval) utils.timers.clearInterval(timerInterval)
		}, (GameSettings.COUNTDOWN_DURATION - 1) * 1000)
	}


	// MARK: ---
	// MARK: TriggerCountdownStart
	function TriggerCountdownStart() {
		if (!iAmTheHost) return
		console.log("GameManager: TriggerCountdownStart: starting in", state.gameStartTime - utcTimestamp, "seconds")

		state.gameState = GameStatus.STARTING
		TriggerStateUpdate()

		OnCountdownStart() // Manually trigger this here to apply it to the host

		if (currentTimeout) {
			utils.timers.clearTimeout(currentTimeout)
		}
		currentTimeout = utils.timers.setTimeout(() => {
			if (state.gameState == GameStatus.IDLE) return
			TriggerRoundStart()
		}, GameSettings.COUNTDOWN_DURATION * 1000)
	}


	// MARK: OnCountdownStart
	function OnCountdownStart() {
		console.log("GameManager: OnCountdownStart: starting in", state.gameStartTime - utcTimestamp, "seconds")
		// The timer now starts automatically. We should pop up a UI to encourage the players to get dressed?
		ShowCountdownTimer()		
		UpdatePlayerList()
	}


	// MARK: ---
	// MARK: TriggerRoundStart
	function TriggerRoundStart() {
		if (!iAmTheHost) return
		console.log("GameManager: TriggerRoundStart")

		state.gameState = GameStatus.ROUND_ACTIVE
		TriggerStateUpdate()

		OnRoundStart() // Manually trigger this here to apply it to the host

		if (currentTimeout) {
			utils.timers.clearTimeout(currentTimeout)
		}
		let duration = 0
		duration += GameSettings.ROUND_START_DELAY
		duration += GameSettings.ROUND_INTERVAL * (state.players.length - 1)
		duration += GameSettings.ROUND_DURATION_PER_PLAYER * state.players.length
		duration *= 1000

		currentTimeout = utils.timers.setTimeout(() => {
			if (state.gameState == GameStatus.IDLE) return
			TriggerVotingStart()
		}, duration)
	}


	// MARK: OnRoundStart
	function OnRoundStart() {
		HideCountdownTimer()

		if (!iAmInTheGame) return
		console.log("GameManager: OnRoundStart")

		MovePlayersToArena()

		StageController.RunShow(state.players, state.outfits)
		OutfitManager.HideNPCMannequin()
	}


	// MARK: ---
	// MARK: TriggerVoting
	function TriggerVotingStart() {
		if (!iAmTheHost) return
		console.log("GameManager: TriggerVoting")

		state.gameState = GameStatus.VOTING
		TriggerStateUpdate()

		OnVotingStart()
		
		if (currentTimeout) {
			utils.timers.clearTimeout(currentTimeout)
		}
		currentTimeout = utils.timers.setTimeout(() => {
			if (state.gameState == GameStatus.IDLE) return
			TriggerVotingEnd()
		}, GameSettings.VOTING_DURATION * 1000)
	}


	// MARK: OnVotingStart
	function OnVotingStart() {
		// Ignore if we are not in the game
		if (!iAmInTheGame) return
		console.log("GameManager: OnVotingStart")

		ShowVotingOptions()
	}

	
	// MARK: ---
	// MARK: OnRequestVote
	function OnRequestVote(vote: RequestVote) {
		// Ignore if we are not the host
		if (!iAmTheHost) return

		// Ignore if we're not in the voting stage
		if (state.gameState != GameStatus.VOTING) {
			console.log("GameManager: OnRequestVote: Not in the voting stage")
			return
		}

		console.log("GameManager: OnRequestVote:", vote)

		// Ignore if the player is not in the list of players
		if (!state.players.includes(vote.voteFrom)) {
			console.log("GameManager: OnRequestVote: Player not in the list of players", vote.voteFrom)
			return
		}
		// Ignore if the player is not in the list of players
		if (!state.players.includes(vote.voteFor)) {
			console.log("GameManager: OnRequestVote: Player not in the list of players", vote.voteFor)
			return
		}

		state.votes[vote.voteFrom] = vote.voteFor
		TriggerStateUpdate()
	}


	// MARK: ---
	// MARK: TriggerVotingEnd
	function TriggerVotingEnd() {
		if (!iAmTheHost) return
		console.log("GameManager: TriggerVotingEnd")

		state.gameState = GameStatus.GAME_ENDED
		TriggerStateUpdate()

		OnVotingEnd()

		if (currentTimeout) {
			utils.timers.clearTimeout(currentTimeout)
		}
		currentTimeout = utils.timers.setTimeout(() => {
			if (state.gameState == GameStatus.IDLE) return
			TriggerIdle()
		}, GameSettings.GAME_ENDED_DURATION * 1000)
	}


	// MARK: OnVotingEnd
	function OnVotingEnd() {
		// Ignore if we are not in the game
		if (!iAmInTheGame) return
		
		console.log("GameManager: OnVotingEnd")
		ShowVotingResults()

		SeatManager.MovePlayerToLobby()
		UpdatePlayerList()

	}


	// MARK: ---
	// MARK: TriggerIdle
	function TriggerIdle() {
		if (!iAmTheHost) return
		console.log("GameManager: TriggerIdle")

		state.gameState = GameStatus.IDLE

		TriggerStateUpdate()

		OnIdle()
	}


	// MARK: OnIdle
	function OnIdle() {
		console.log("GameManager: OnIdle")
		ResetState()
	}


	// MARK: OnAbort
	function OnAbort() {
		console.log("GameManager: OnAbort")

		// Clear any existing timers
		if (currentTimeout) {
			utils.timers.clearTimeout(currentTimeout)
		}

		// Reset our gamestate
		ResetState()

		// Move everyone back to the lobby
		SeatManager.MovePlayerToLobby()

		// Let the stage controller know that the game has ended
		StageController.Abort()
	}


	// MARK: ---
	// MARK: OnStateRequest
	function OnStateRequest() {
		console.log("GameManager: OnStateRequest()")
		if (iAmTheHost) {
			TriggerStateUpdate()
		}
	}


	// MARK: TriggerStateUpdate
	function TriggerStateUpdate() {
		if (!iAmTheHost) return
		console.log("GameManager: SendStateToAllClients")
		
		// Update the timestamp
		state.timestamp = utcTimestamp

		// Send the state to all clients
		sceneMessageBus.emit('stateUpdate', state)
		UpdatePlayerList()
	}


	// MARK: OnStateUpdate
	function OnStateUpdate(newState: GameState) {
		console.log("GameManager: OnStateUpdate:", newState)

		// Ignore if we don't have localPlayer data - eg after a player joins the scene while we're still loading
		if (!localPlayer || !localPlayer.userId) return

		// Ignore updates if we are the host
		if (iAmTheHost && newState.hostUserId !== localPlayer!.userId) {
			console.log("GameManager: OnStateUpdate: Problem, another player thinks they are the host!")
			return
		}
		if (iAmTheHost) return


		// If there's a game in progress and the update didn't come from the current host, ignore it
		if (state.gameState != GameStatus.IDLE && newState.hostUserId !== state.hostUserId) {
			console.log("GameManager: OnStateUpdate: Recieved an update from someone other than host")
			return
		}

		// Ignore updates if the timestamp is older than the current timestamp
		if (newState.timestamp < state.timestamp) {
			console.log("GameManager: OnStateUpdate: Recieved an update with an older timestamp")
			return
		}

		// Store the state, then update it
		const lastGameState = state.gameState
		state = newState

		// Check if we are in the game
		iAmInTheGame = state.players.includes(localPlayer!.userId)

		if (state.gameState != lastGameState) {
			switch (state.gameState) {
				case GameStatus.STARTING:
					OnCountdownStart()
					break
				case GameStatus.ROUND_ACTIVE:
					OnRoundStart()
					break
				case GameStatus.VOTING:
					OnVotingStart()
					break
				case GameStatus.GAME_ENDED:
					OnVotingEnd()
					break
				case GameStatus.IDLE:
					OnIdle()
					break
			}
		}

		UpdatePlayerList()
	}
	

	// MARK: ---
	// MARK: Utils
	function MovePlayersToArena() {
		if (!localPlayer || !localPlayer.userId) return
		const playerIndex = state.players.indexOf(localPlayer.userId)
		SeatManager.MovePlayerToSeat(playerIndex)
	}


}
