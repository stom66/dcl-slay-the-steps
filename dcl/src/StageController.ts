import * as utils from '@dcl-sdk/utils'
import { GameSettings } from "./_settings"
import { _GameManager } from './GameManager'
import { GetPlayerName, GetPlayerProfile } from './utils'
import { Color3, Quaternion, Vector3 } from '@dcl/sdk/math'
import { AvatarShape, EasingFunction, engine, Entity, Transform, Tween, TweenLoop, TweenSequence, tweenSystem, TweenSystem } from '@dcl/sdk/ecs'
import { getPlayerData } from '~system/Players'
import { getPlayer } from '@dcl/sdk/players'
import { _CameraController } from './CameraController'


// Handles all Stage related stuff, such as spawning NPCs to represent the player
// Also handles player cameras

type NPCOutfit = {
	name     : string
	bodyShape: string
	wearables: string[]
	emotes   : string[]
	eyeColor : Color3
	skinColor: Color3
	hairColor: Color3
}

class StageController {
	isRunning       : boolean = false

	durationPauseAtTop             = 1.5 // How long should the avatar wait at the top of the stairs
	durationPauseAtCatwalkJunction = 1.5 // How long to pause at the Catwalk Junction
	durationPauseAtCatwalkMidpoint = 1.5 // How long to pause at the Catwalk Midpoint
	durationRemaining              = (GameSettings.ROUND_DURATION_PER_PLAYER - this.durationPauseAtTop - this.durationPauseAtCatwalkJunction - this.durationPauseAtCatwalkMidpoint)

	dSpawnToStairsWait             = Vector3.distance(GameSettings.NPC_SPAWN_POSITION, GameSettings.NPC_PATH_STAIRS_WAIT)
	dStairsWaitToTop               = Vector3.distance(GameSettings.NPC_PATH_STAIRS_WAIT, GameSettings.NPC_PATH_STAIRS_TOP)
	dStairsTopToBottom             = Vector3.distance(GameSettings.NPC_PATH_STAIRS_TOP, GameSettings.NPC_PATH_STAIRS_BOTTOM)
	dStairsBottomToCatwalkMidpoint = Vector3.distance(GameSettings.NPC_PATH_STAIRS_BOTTOM, GameSettings.NPC_PATH_CATWALK_MIDPOINT)
	dCatwalkMidpointToJunction     = Vector3.distance(GameSettings.NPC_PATH_CATWALK_MIDPOINT, GameSettings.NPC_PATH_CATWALK_JUNCTION)
	dCatwalkJunctionToExit         = Vector3.distance(GameSettings.NPC_PATH_CATWALK_JUNCTION, GameSettings.NPC_PATH_EXIT_LEFT)

	totalDistance                  = this.dSpawnToStairsWait + this.dStairsWaitToTop + this.dStairsTopToBottom + this.dStairsBottomToCatwalkMidpoint + this.dCatwalkMidpointToJunction + this.dCatwalkJunctionToExit
	
	durationToStairsWait           = this.durationRemaining * this.dSpawnToStairsWait / this.totalDistance
	durationToStairsTop            = this.durationRemaining * this.dStairsWaitToTop / this.totalDistance
	durationToStairsBottom         = this.durationRemaining * this.dStairsTopToBottom / this.totalDistance
	durationToCatwalkMidpoint      = this.durationRemaining * this.dStairsBottomToCatwalkMidpoint / this.totalDistance
	durationToCatwalkJunction      = this.durationRemaining * this.dCatwalkMidpointToJunction / this.totalDistance
	durationToCatwalkExit          = this.durationRemaining * this.dCatwalkJunctionToExit / this.totalDistance

	constructor() {
		console.log("StageController constructor")
	}

	init() {
		console.log("StageController init")
	}

	RunShow(players: string[]) {
		console.log("StageController RunShow")

		this.isRunning = true

		// Create all NPCs first and track them by userId
		const npcs: { userId: string, npc: Entity }[] = []
		const cameraTargets: Map<Entity, Entity> = new Map()

		players.forEach((userId) => {
			const playerName = GetPlayerName(userId)
			console.log("StageController RunShow: playerName", playerName)

			// Create the NPC
			const npc = this.CreateNPC(userId)
			if (!npc) {
				console.error("StageController RunShow: Failed to create NPC clone for user", userId)
				return
			}
			npcs.push({ userId, npc })

			// Create the camera target
			const npcCameraTarget = engine.addEntity()
			Transform.create(npcCameraTarget, {
				position: Vector3.create(0, 1, 0),
				parent: npc
			})
			cameraTargets.set(npc, npcCameraTarget)
		})

		const npcCount = npcs.length
		const npcInterval = GameSettings.ROUND_DURATION_PER_PLAYER
		const totalDuration = GameSettings.ROUND_START_DELAY + (npcCount * npcInterval)

		let currentIndex = 0

		const animateNextNPC = () => {
			if (!this.isRunning || currentIndex >= npcCount) {
				return
			}

			const { userId, npc } = npcs[currentIndex]

			// Track the current NPC for the camera
			const cameraTarget = cameraTargets.get(npc)
			if (cameraTarget) {
				_CameraController.TrackEntity(cameraTarget)
			}

			// Animate the NPC (alternate left/right)
			const goLeft = currentIndex % 2 === 0
			this.AnimateNPC(npc, goLeft)

			// Prepare to animate the next NPC when this one is done
			currentIndex++

			if (currentIndex < npcCount) {
				utils.timers.setTimeout(() => {
					animateNextNPC()
				}, npcInterval * 1000)
			}
		}

		// Start the sequence after the round delay
		utils.timers.setTimeout(() => {
			animateNextNPC()
		}, GameSettings.ROUND_START_DELAY * 1000)

		// When show has ended (after all NPCs have had a turn)
		utils.timers.setTimeout(() => {
			_CameraController.ResetCamera()
		}, totalDuration * 1000)
	}

	Abort() {
		this.isRunning = false
	}


	CreateNPC(userId: string): Entity | undefined {
		console.log("StageController CreateNPCClone: userId", userId)

		// Fetch the userData
		let userData = getPlayer({ userId: userId })
		console.log(userData)	  
		if (!userData || !userData.wearables) return

		// Build the outfit data for the NPC
		const outfit: NPCOutfit = {
			name     : userData.name,
			bodyShape: userData.avatar!.bodyShapeUrn || "",
			wearables: userData.wearables,
			emotes   : userData.emotes,
			eyeColor : userData.avatar!.eyesColor || Color3.create(0.5, 0.5, 0.5),
			skinColor: userData.avatar!.skinColor || Color3.create(0.5, 0.5, 0.5),
			hairColor: userData.avatar!.hairColor || Color3.create(0.5, 0.5, 0.5)
		}

		// Spawn the Avatar
		const npc = engine.addEntity()
		AvatarShape.create(npc, {...outfit, id: "npc_" + userId})

		// Position the Avatar
		Transform.create(npc, {
			position: GameSettings.NPC_SPAWN_POSITION,
			rotation: GameSettings.NPC_SPAWN_ROTATION,
			scale   : GameSettings.NPC_SPAWN_SCALE
		})

		return npc
	}

	DestroyNPC(npc: Entity) {
		console.log("StageController DestroyNPC: npc", npc)
		
		const tween = Tween.getMutable(npc)
		if (tween) {
			tween.playing = false
			Tween.deleteFrom(npc)
		}

		engine.removeEntity(npc)

	}

	AnimateNPC(
		npc: Entity, 
		goLeft: boolean = false
	) {
		console.log("StageController AnimateNPC: npc", npc)

		Tween.setMove(npc, 
			GameSettings.NPC_SPAWN_POSITION, 
			GameSettings.NPC_PATH_STAIRS_WAIT, 
			this.durationToStairsWait * 1000
		)

		TweenSequence.create(npc, {
			sequence: [
				{ // Pause at the top of the stairs
					duration: this.durationPauseAtTop * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_STAIRS_WAIT,
						end: GameSettings.NPC_PATH_STAIRS_WAIT,
					}),
				},
				{ // Walk to the top of the stairs
					duration: this.durationToStairsTop * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_STAIRS_WAIT,
						end: GameSettings.NPC_PATH_STAIRS_TOP,
					}),
				},
				{ // Walk down the stairs to the bottom
					duration: this.durationToStairsBottom * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_STAIRS_TOP,
						end: GameSettings.NPC_PATH_STAIRS_BOTTOM,
					}),
				},
				{ // Walk to the catwalk midpoint junction
					duration: this.durationToCatwalkMidpoint * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_STAIRS_BOTTOM,
						end: GameSettings.NPC_PATH_CATWALK_MIDPOINT,
					}),
				},
				{ // Pause at the catwalk midpoint
					duration: this.durationPauseAtCatwalkMidpoint * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_CATWALK_MIDPOINT,
						end: GameSettings.NPC_PATH_CATWALK_MIDPOINT,
					}),
				},
				{ // Walk to the catwalk junction
					duration: this.durationToCatwalkMidpoint * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_CATWALK_MIDPOINT,
						end: GameSettings.NPC_PATH_CATWALK_JUNCTION,
					}),
				},
				{ // Turn at the catwalk junction
					duration: this.durationPauseAtCatwalkJunction / 2 * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Rotate({
						start: Quaternion.fromEulerDegrees(0, 180, 0),
						end: Quaternion.fromEulerDegrees(0, goLeft ? 90 : -90, 0),
					}),
				},
				{ // Pause at the catwalk junction
					duration: this.durationPauseAtCatwalkJunction / 2 * 1000,
					easingFunction: EasingFunction.EF_LINEAR,
					mode: Tween.Mode.Move({
						start: GameSettings.NPC_PATH_CATWALK_JUNCTION,
						end: GameSettings.NPC_PATH_CATWALK_JUNCTION,
					}),
				},
				{ // Walk to the exit (either left or right)
					duration: this.durationToCatwalkExit * 1000,
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
				console.log("StageController AnimateNPC: tween completed for npc", npc)
				const tween = Tween.getMutable(npc)
				tween.playing = false
				Tween.deleteFrom(npc)
			}
		})
	}

}

export const _StageController = new StageController()