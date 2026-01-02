import * as utils from '@dcl-sdk/utils'
import { AvatarEmoteCommand, AvatarShape, EasingFunction, engine, Entity, PBAvatarEmoteCommand, PlayerIdentityData, Transform, Tween, TweenSequence, tweenSystem } from '@dcl/sdk/ecs'
import { Color3, Quaternion, Vector3 } from '@dcl/sdk/math'
import { getPlayer, onEnterScene } from '@dcl/sdk/players'

import { GameSettings } from "./_settings"
import { CameraController } from './CameraController'
import { SoundManager } from './SoundManager'
import { Outfit } from './OutfitManager'
import { SetCurrentPlayer } from './ui.Game.PlayerList'
import { ShowYouAreNext } from './ui.Game.YouAreNext'
import { ShowEmotesHint } from './ui.Game.Emotes'
import { HideHowToPlay } from './ui.Game.HowToPlay'
import { HideWarning } from './ui.Game.Warning'


// Handles all Stage related stuff, such as spawning NPCs to represent the player
// Also handles player cameras

let localPlayer: any

export namespace StageController {
	let isRunning                      : boolean                   = false
	let currentTimeout                 : utils.TimerId | undefined = undefined

	let playerToNPC                    : Map<Entity, Entity> = new Map()
	let NPCToPlayer                    : Map<Entity, Entity> = new Map()

	const durationPauseAtTopOfStairs     = 2 // How long should the avatar wait at the top of the stairs
	const durationPauseAtCatwalkJunction = 3 // How long to pause at the Catwalk Junction
	const durationPauseAtCatwalkMidpoint = 2.5 // How long to pause at the Catwalk Midpoint
	const durationRemaining              = (GameSettings.ROUND_DURATION_PER_PLAYER - durationPauseAtTopOfStairs - durationPauseAtCatwalkJunction - durationPauseAtCatwalkMidpoint)

	const dSpawnToStairsWait             = Vector3.distance(GameSettings.NPC_SPAWN_POSITION, GameSettings.NPC_PATH_STAIRS_WAIT)
	const dStairsWaitToTop               = Vector3.distance(GameSettings.NPC_PATH_STAIRS_WAIT, GameSettings.NPC_PATH_STAIRS_TOP)
	const dStairsTopToBottom             = Vector3.distance(GameSettings.NPC_PATH_STAIRS_TOP, GameSettings.NPC_PATH_STAIRS_BOTTOM)
	const dStairsBottomToCatwalkMidpoint = Vector3.distance(GameSettings.NPC_PATH_STAIRS_BOTTOM, GameSettings.NPC_PATH_CATWALK_MIDPOINT)
	const dCatwalkMidpointToJunction     = Vector3.distance(GameSettings.NPC_PATH_CATWALK_MIDPOINT, GameSettings.NPC_PATH_CATWALK_JUNCTION)
	const dCatwalkJunctionToExit         = Vector3.distance(GameSettings.NPC_PATH_CATWALK_JUNCTION, GameSettings.NPC_PATH_EXIT_LEFT)

	const totalDistance                  = dSpawnToStairsWait + dStairsWaitToTop + dStairsTopToBottom + dStairsBottomToCatwalkMidpoint + dCatwalkMidpointToJunction + dCatwalkJunctionToExit
	
	const durationToStairsWait           = durationRemaining * dSpawnToStairsWait / totalDistance
	const durationToStairsTop            = durationRemaining * dStairsWaitToTop / totalDistance
	const durationToStairsBottom         = durationRemaining * dStairsTopToBottom / totalDistance
	const durationToCatwalkMidpoint      = durationRemaining * dStairsBottomToCatwalkMidpoint / totalDistance
	const durationToCatwalkJunction      = durationRemaining * dCatwalkMidpointToJunction / totalDistance
	const durationToCatwalkExit          = durationRemaining * dCatwalkJunctionToExit / totalDistance


	// MARK: init
	export function init() {
		console.log("StageController: init()")

		// Handle emotes from local player, players already in scene, and players who join
		AvatarEmoteCommand.onChange(engine.PlayerEntity, (emote) => {
			HandleEmotes(engine.PlayerEntity, emote)
		})

		// All players cuirrently in scene
		for (const [entity, data, transform] of engine.getEntitiesWith(
			PlayerIdentityData,
			Transform
		)) {
			console.log('PLAYER: ', { entity, data, transform })
			AvatarEmoteCommand.onChange(entity, (emote) => {
				HandleEmotes(entity, emote)
			})
		}

		// Players who enter the scene
		onEnterScene((player) => {
			if (!player) return
			AvatarEmoteCommand.onChange(player.entity, (emote) => {
				HandleEmotes(player.entity, emote)
			})
		})

		// Ensure we have player data for local player
		utils.timers.setTimeout(() => {
			localPlayer = getPlayer()
			if (!localPlayer) {
				console.error("StageController: init(): localPlayer not found")
			}
		}, 2000)

	}

	// MARK: RunShow
	export function RunShow(
		players: string[], 
		outfits: Outfit[]
	) {
		console.log("StageController: RunShow()")

		isRunning = true

		// Create all NPCs first and track them by userId
		const npcs: { userId: string, npc: Entity }[] = []
		const cameraTargets: Map<Entity, Entity> = new Map()

		players.forEach((userId) => {
			console.log("StageController: RunShow(): setup for userId", userId)

			const playerData = getPlayer({ userId: userId })
			if (!playerData) {
				console.error("StageController RunShow(): Failed to get player data for user", userId)
				return
			}

			// Get their outfit
			const outfit = outfits.find((o) => o.userId === userId)
			if (!outfit) {
				console.error("StageController RunShow(): Failed to find outfit for user", userId)
				return
			}
			
			// Create the NPC
			const npc = CreateNPC(outfit)
			if (!npc) {
				console.error("StageController RunShow(): Failed to create NPC clone for user", userId)
				return
			}
			npcs.push({ userId, npc })

			// Store the NPC in the maps
			playerToNPC.set(playerData.entity, npc)
			NPCToPlayer.set(npc, playerData.entity)

			// Create the camera target
			const npcCameraTarget = engine.addEntity()
			Transform.create(npcCameraTarget, {
				position: Vector3.create(0, 1, 0),
				parent: npc
			})
			cameraTargets.set(npc, npcCameraTarget)
		})

		const npcCount = npcs.length
		const npcInterval = GameSettings.ROUND_DURATION_PER_PLAYER + GameSettings.ROUND_INTERVAL
		//const totalDuration = GameSettings.ROUND_START_DELAY + (npcCount * npcInterval)

		let currentIndex = 0

		const animateNextNPC = () => {
			if (!isRunning || currentIndex >= npcCount) {
				return
			}

			const { userId, npc } = npcs[currentIndex]
			console.log("StageController: animateNextNPC():", userId)

			// Notify the UI that the player's turn has started
			OnPlayerTurnStart(userId)

			// Track the current NPC for the camera
			const cameraTarget = cameraTargets.get(npc)
			if (cameraTarget) {
				CameraController.TrackEntity(cameraTarget)
			}

			// Animate the NPC (alternate left/right)
			const goLeft = currentIndex % 2 === 0
			AnimateNPC(npc, goLeft)

			// Prepare to animate the next NPC when this one is done
			currentIndex++

			// Start a timeout, to complete when the NPC hits the end of the runway
			if (currentTimeout) utils.timers.clearTimeout(currentTimeout)
			currentTimeout = utils.timers.setTimeout(() => {
				// Notify the UI that the player's turn has ended
				OnPlayerTurnEnd(userId)

				// If we're not at the last NPC, animate the next one
				if (currentIndex < npcCount) animateNextNPC()

				// When show has ended (after all NPCs have had a turn)
				else OnShowEnd()
			}, npcInterval * 1000)

		// Notify the next player that they are next
			const nextUserId = players[currentIndex]
			if (nextUserId === localPlayer?.userId) {
				utils.timers.setTimeout(() => {
					ShowYouAreNext()
				}, (GameSettings.ROUND_DURATION_PER_PLAYER - GameSettings.YOU_ARE_NEXT_PREEMPT_TIME) * 1000)
			}
		}

		// Notify the UI that the show has started
		OnShowStart()

		// Notify the first user that it's their turn coming up
		const firstUserId = players[0]
		if (firstUserId === localPlayer?.userId) {
			utils.timers.setTimeout(() => {
				ShowYouAreNext(true)
			}, (GameSettings.ROUND_START_DELAY - GameSettings.YOU_ARE_NEXT_PREEMPT_TIME) * 1000)
		}

		// Start the sequence after the start delay
		if (currentTimeout) utils.timers.clearTimeout(currentTimeout)
		currentTimeout = utils.timers.setTimeout(() => {
			animateNextNPC()
		}, GameSettings.ROUND_START_DELAY * 1000)
	}

	//MARK: OnPlayerTurnStart
	function OnPlayerTurnStart(userId: string) {
		console.log("StageController: OnPlayerTurnStart(): userId", userId)
		SetCurrentPlayer(userId)
		if (userId === localPlayer?.userId) {
			ShowEmotesHint()
		}
	}

	//MARK: OnPlayerTurnEnd
	function OnPlayerTurnEnd(userId: string) {
		console.log("StageController: OnPlayerTurnEnd(): userId", userId)
		//SetCurrentPlayer(undefined) // Don't think we should do this in case of race conditions.
	}

	// MARK: OnShowStart
	function OnShowStart() {
		console.log("StageController: OnShowStart()")
		SoundManager.StartBGM()
		HideHowToPlay()
		HideWarning()
	}

	// MARK: OnShowEnd
	function OnShowEnd() {
		console.log("StageController: OnShowEnd()")

		SetCurrentPlayer(undefined)
		CameraController.ResetCamera()
		SoundManager.StopBGM()

		// Remove all the NPC entities
		playerToNPC.forEach((npc: Entity, player) => {
			console.log("StageController: OnShowEnd(): destroying npc:", npc.toString())
			DestroyNPC(npc)
		})
	}


	// MARK: Abort
	export function Abort() {
		OnShowEnd()
		isRunning = false
		if (currentTimeout) utils.timers.clearTimeout(currentTimeout)
	}

	// MARK: CreateNPC
	function CreateNPC(outfit: Outfit): Entity | undefined {
		console.log("StageController: CreateNPCClone(): userId", outfit.userId)

		// Fetch the userData
		let userData = getPlayer({ userId: outfit.userId })
		console.log(userData)	  
		if (!userData || !userData.wearables) return

		// Once outfitmanager is working, we'll spawn the outfit instead
		
		// Spawn the Avatar
		const npc = engine.addEntity()

		// the avatars wearables are in the outfit array, so we need to get the wearables from the outfit
		AvatarShape.create(npc, {
			id       : "npc_" + outfit.userId + "    ",
			name     : userData.name,
			bodyShape: outfit.bodyShape,
			wearables: outfit.wearables.map((w) => w.urn) ?? [],
			emotes   : userData.emotes,
			eyeColor : userData.avatar!.eyesColor || Color3.create(0.5, 0.5, 0.5),
			skinColor: outfit.skinColor,
			hairColor: outfit.hairColor
		})

		// Position the Avatar
		Transform.create(npc, {
			position: GameSettings.NPC_SPAWN_POSITION,
			rotation: GameSettings.NPC_SPAWN_ROTATION,
			scale   : GameSettings.NPC_SPAWN_SCALE
		})

		return npc
	}

	// MARK: DestroyNPC
	function DestroyNPC(npc: Entity) {
		console.log("StageController: DestroyNPC(): npc", npc)
		
		const tween = Tween.getMutableOrNull(npc)
		if (tween) {
			tween.playing = false
			Tween.deleteFrom(npc)
		}

		engine.removeEntity(npc)

		// remove the npc from the npcs map
		const playerEntity = NPCToPlayer.get(npc)
		if (playerEntity) {
			playerToNPC.delete(playerEntity)
			NPCToPlayer.delete(npc)
		}

	}

	// MARK: Handle emotes
	function HandleEmotes(player: Entity, emote: PBAvatarEmoteCommand | undefined) {
		console.log("StageController: HandleEmotes(): player", player, "emote", emote)
		const npc = playerToNPC.get(player)
		if (npc) {
			const avatarShape = AvatarShape.getMutableOrNull(npc)
			if (avatarShape) {
				avatarShape.expressionTriggerId = emote?.emoteUrn
				avatarShape.expressionTriggerTimestamp = (avatarShape.expressionTriggerTimestamp ?? 0) + 1
			}
		}
	}

	// MARK: AnimateNPC
	function AnimateNPC(
		npc: Entity, 
		goLeft: boolean = false
	) {
		console.log("StageController: AnimateNPC(): npc", npc)

		Tween.setMove(npc, 
			GameSettings.NPC_SPAWN_POSITION, 
			GameSettings.NPC_PATH_STAIRS_WAIT, 
			durationToStairsWait * 1000
		)

		TweenSequence.create(npc, {
			sequence: [
				{ // Pause at the top of the stairs
					duration: durationPauseAtTopOfStairs * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_STAIRS_WAIT,
						end: GameSettings.NPC_PATH_STAIRS_WAIT,
					}),
				},
				{ // Walk to the top of the stairs
					duration: durationToStairsTop * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_STAIRS_WAIT,
						end: GameSettings.NPC_PATH_STAIRS_TOP,
					}),
				},
				{ // Walk down the stairs to the bottom
					duration: durationToStairsBottom * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_STAIRS_TOP,
						end: GameSettings.NPC_PATH_STAIRS_BOTTOM,
					}),
				},
				{ // Walk to the catwalk midpoint junction
					duration: durationToCatwalkMidpoint * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_STAIRS_BOTTOM,
						end: GameSettings.NPC_PATH_CATWALK_MIDPOINT,
					}),
				},
				{ // Pause at the catwalk midpoint
					duration: durationPauseAtCatwalkMidpoint * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_CATWALK_MIDPOINT,
						end: GameSettings.NPC_PATH_CATWALK_MIDPOINT,
					}),
				},
				{ // Walk to the catwalk junction
					duration: durationToCatwalkMidpoint * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_CATWALK_MIDPOINT,
						end: GameSettings.NPC_PATH_CATWALK_JUNCTION,
					}),
				},
				{ // Turn at the catwalk junction
					duration: durationPauseAtCatwalkJunction * 0.2 * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Rotate({
						start: Quaternion.fromEulerDegrees(0, 180, 0),
						end: Quaternion.fromEulerDegrees(0, goLeft ? 90 : -90, 0),
					}),
				},
				{ // Pause at the catwalk junction
					duration: durationPauseAtCatwalkJunction * 0.8 * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_CATWALK_JUNCTION,
						end: GameSettings.NPC_PATH_CATWALK_JUNCTION,
					}),
				},
				{ // Walk to the exit (either left or right)
					duration: durationToCatwalkExit * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_CATWALK_JUNCTION,
						end: goLeft ? GameSettings.NPC_PATH_EXIT_LEFT : GameSettings.NPC_PATH_EXIT_RIGHT,
					}),
				},
			]
		})

		engine.addSystem(() => {
			const tweenCompleted = tweenSystem.tweenCompleted(npc)
			if (tweenCompleted) {
				console.log("StageController: AnimateNPC(): tween completed for npc", npc)
				const tween = Tween.getMutable(npc)
				if (tween) {
					tween.playing = false	
					Tween.deleteFrom(npc)
				}
			}
		})
	}

}
