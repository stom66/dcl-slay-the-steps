import * as utils from '@dcl-sdk/utils'
import { GameSettings } from "./_settings"
import { _GameManager } from './GameManager'
import { GetPlayerName, GetPlayerProfile } from './utils'
import { Color3, Quaternion, Vector3 } from '@dcl/sdk/math'
import { AvatarShape, engine, Entity, Transform } from '@dcl/sdk/ecs'
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
	isRunning       : boolean            = false
	currentNPC      : Entity | undefined = undefined
	currentNPCUserId: string | undefined = undefined

	pathToStairsTop = [
		GameSettings.NPC_SPAWN_POSITION,
		GameSettings.NPC_PATH_STAIRS_TOP,
	]
	pathToCatwalkJunction = [
		GameSettings.NPC_PATH_STAIRS_TOP, 
		GameSettings.NPC_PATH_STAIRS_BOTTOM,
		GameSettings.NPC_PATH_CATWALK_JUNCTION,
	]
	pathToExitRight = [
		GameSettings.NPC_PATH_CATWALK_JUNCTION,
		Vector3.create(30, 10.53, 12.07),
	]
	pathToExitLeft = [
		GameSettings.NPC_PATH_CATWALK_JUNCTION,
		Vector3.create(2, 10.53, 12.07),
	]

	durationToStairsTop    = 1 // How long to spend walking from the spawn point to the top of the stairs
	durationPauseAtTop     = 1 // How long should the avatar wait at the top of the stairs
	durationPauseAtCatwalk = 1 // How long to pause at the Catwalk Junction
	durationRemaining      = (GameSettings.ROUND_DURATION_PER_PLAYER - this.durationToStairsTop - this.durationPauseAtTop - this.durationPauseAtCatwalk) // How long to spend walking from the top of the stairs to the exit
	durationToCatwalk      = this.durationRemaining * 0.6
	durationToExit         = this.durationRemaining * 0.4

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
		engine.removeEntity(npc)
		if (this.currentNPC === npc) {
			this.currentNPC = undefined
			this.currentNPCUserId = undefined
		}
	}

	AnimateNPC(
		npc: Entity, 
		goLeft: boolean = false
	) {
		console.log("StageController AnimateNPC: npc", npc)


		// Walk from the spawn point to the top of the stairs
		utils.paths.startStraightPath(npc, this.pathToStairsTop, this.durationToStairsTop, true, () => {
			// OnComplete, wait at the top of the stairs
			utils.timers.setTimeout(() => {
				// Walk down the stairs to the junction
				utils.paths.startStraightPath(npc, this.pathToCatwalkJunction, this.durationToCatwalk, true, () => {
					// OnComplete, wait at the junction
					utils.timers.setTimeout(() => {
						// Walk to the exit (either left or right)
						const path = goLeft ? this.pathToExitLeft : this.pathToExitRight
						utils.paths.startStraightPath(npc, path, this.durationToExit, true, () => {
							console.log("StageController AnimateNPC: path complete")
						})
					}, this.durationPauseAtCatwalk * 1000)
				})
			}, this.durationPauseAtTop * 1000)
		})
	}

}

export const _StageController = new StageController()