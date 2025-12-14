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
	name: string
	bodyShape: string
	wearables: string[]
	emotes: string[]
	eyeColor: Color3
	skinColor: Color3
	hairColor: Color3
}

class StageController {
	isRunning: boolean = false
	currentNPC: Entity | undefined = undefined
	currentNPCUserId: string | undefined = undefined

	npcs: Record<string, Entity> = {}

	constructor() {
		console.log("StageController constructor")
	}

	init() {
		console.log("StageController init")
	}

	RunShow(players: string[]) {
		console.log("StageController RunShow")

		const npcInterval = GameSettings.ROUND_DURATION_PER_PLAYER * 1000
		const totalDuration = players.length * npcInterval
		this.isRunning = true
		// Loop through each of the playters we've been given

		let index = 0
		players.forEach((userId) => {

			const playerName = GetPlayerName(userId)
			console.log("StageController RunShow: playerName", playerName)

			
			const npc = this.CreateNPC(userId)
			if (!npc) {
				console.error("StageController RunShow: Failed to create NPC clone for user", userId)
				return
			}
			this.npcs[userId] = npc

			utils.timers.setTimeout(() => {
				// Handle aborted runs
				if (!this.isRunning) return

				_CameraController.TrackEntity(npc)

				this.AnimateNPC(npc)
				utils.timers.setTimeout(() => {
					this.DestroyNPC(npc)
				}, GameSettings.ROUND_DURATION_PER_PLAYER * 1000)

				index++
			}, index * npcInterval)
		})

		// When show has ended
		utils.timers.setTimeout(() => {
			_CameraController.ResetCamera()
		}, totalDuration)
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
			position: GameSettings.STAGE_SPAWN_POSITION,
			rotation: GameSettings.STAGE_SPAWN_ROTATION,
			scale   : GameSettings.STAGE_SPAWN_SCALE
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

	AnimateNPC(npc: Entity) {
		console.log("StageController AnimateNPC: npc", npc)

		let animateTimer = 0
		let animateDuration = 1
		let lifespanTimer = 0
		let lifespanDuration = 4
		// system
		engine.addSystem((dt: number) => {
			animateTimer += dt
			lifespanTimer += dt
			
			// Kill them at the end of their lifespan
			if (lifespanTimer >= lifespanDuration) {
				engine.removeEntity(npc)
				return
			}
			
			// Loop their animation
			if (animateTimer >= animateDuration) {
				// Trigger the clap emote
				AvatarShape.getMutable(npc).expressionTriggerTimestamp =+ 1 
				
				animateTimer = 0 // Reset timer
			}

			// Move them
		})
	}

}

export const _StageController = new StageController()