import * as utils from '@dcl-sdk/utils'
import { GameSettings } from "./_settings"
import { _GameManager } from './GameManager'
import { GetPlayerName, GetPlayerProfile } from './utils'
import { Color3, Quaternion, Vector3 } from '@dcl/sdk/math'
import { AvatarShape, engine, Entity, Transform } from '@dcl/sdk/ecs'
import { getPlayerData } from '~system/Players'
import { getPlayer } from '@dcl/sdk/players'
import { _CameraController } from './CameraController'
import * as npcToolkit from 'dcl-npc-toolkit'

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
	isRunning       : boolean            = false
	currentNPC      : Entity | undefined = undefined
	currentNPCUserId: string | undefined = undefined


	durationToStairsTop    = 0.75 // How long to spend walking from the spawn point to the top of the stairs
	durationPauseAtTop     = 1.5 // How long should the avatar wait at the top of the stairs
	durationPauseAtCatwalk = 1.5 // How long to pause at the Catwalk Junction
	durationRemaining      = (GameSettings.ROUND_DURATION_PER_PLAYER - this.durationToStairsTop - this.durationPauseAtTop - this.durationPauseAtCatwalk) // How long to spend walking from the top of the stairs to the exit
	durationToCatwalk      = this.durationRemaining * 0.65
	durationToExit         = this.durationRemaining * 0.35

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
		players.forEach((userId) => {
			const playerName = GetPlayerName(userId)
			console.log("StageController RunShow: playerName", playerName)

			const npc = this.CreateNPC(userId)
			if (!npc) {
				console.error("StageController RunShow: Failed to create NPC clone for user", userId)
				return
			}
			npcs.push({ userId, npc })
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
			_CameraController.TrackEntity(npc)

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

		// Create the NPC via the toolkit
		const npc = npcToolkit.create(
			{
				position: GameSettings.NPC_SPAWN_POSITION,
				rotation: GameSettings.NPC_SPAWN_ROTATION,
				scale   : GameSettings.NPC_SPAWN_SCALE
			},
			{
				type               : npcToolkit.NPCType.AVATAR,
				faceUser           : false,
				onlyExternalTrigger: true,
				noUI               : true,
				hoverText          : "Sexy as fuck",
				textBubble         : false,
				onActivate         : (npc) => {
					console.log("StageController CreateNPC: npc activated")
				},
			}
		)
		const avatarComp = AvatarShape.getMutable(npc)
		avatarComp.wearables = userData.wearables
		avatarComp.name      = ""
		avatarComp.bodyShape = userData.avatar?.bodyShapeUrn
		avatarComp.eyeColor  = userData.avatar?.eyesColor
		avatarComp.skinColor = userData.avatar?.skinColor
		avatarComp.hairColor = userData.avatar?.hairColor

		return npc
	}

	AnimateNPC(
		npc: Entity, 
		goLeft: boolean = false
	) {
		console.log("StageController AnimateNPC: npc", npc)

		// Calculate cumulative timings for each path segment
		// All times in milliseconds
		const timeToStairsBottom = (this.durationToStairsTop + this.durationPauseAtTop) * 1000
		const timeToJunction     = timeToStairsBottom + (this.durationToCatwalk * 0.45 * 1000)
		const timeToExit         = timeToJunction + (this.durationToCatwalk * 0.55 * 1000) + (this.durationPauseAtCatwalk * 1000)

		// Segment 1: Spawn → Stairs Top
		npcToolkit.followPath(npc, {
			path            : [GameSettings.NPC_PATH_STAIRS_TOP],
			totalDuration   : this.durationToStairsTop, 
			loop            : false, 
			curve           : false
		})

		// Segment 2: Stairs Top → Stairs Bottom (after pause at top)
		utils.timers.setTimeout(() => {
			npcToolkit.followPath(npc, {
				path            : [GameSettings.NPC_PATH_STAIRS_BOTTOM, GameSettings.NPC_PATH_CATWALK_JUNCTION],
				totalDuration   : this.durationToCatwalk, 
				loop            : false, 
				curve           : false
			})
		}, timeToJunction)

		// Segment 4: Catwalk Junction → Exit (after pause at junction)
		utils.timers.setTimeout(() => {
			const exit = goLeft ? GameSettings.NPC_PATH_EXIT_LEFT : GameSettings.NPC_PATH_EXIT_RIGHT
			npcToolkit.followPath(npc, {
				path            : [exit],
				totalDuration   : this.durationToExit, 
				loop            : false, 
				curve           : false
			})
			console.log("StageController AnimateNPC: path complete")
		}, timeToExit)
	}

	DestroyNPC(npc: Entity) {
		console.log("StageController DestroyNPC: npc", npc)
		engine.removeEntity(npc)
		if (this.currentNPC === npc) {
			this.currentNPC = undefined
			this.currentNPCUserId = undefined
		}
	}

}

export const _StageController = new StageController()