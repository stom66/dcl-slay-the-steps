import { AvatarShape, EasingFunction, engine, Entity, PBAvatarEmoteCommand, Transform, Tween, TweenSequence, tweenSystem } from '@dcl/sdk/ecs'
import { Color3, Quaternion, Vector3 } from '@dcl/sdk/math'
import { getPlayer } from '@dcl/sdk/players'
///import * as utils from '@dcl-sdk/utils'

import { GameStatus } from 'src/shared/enums'
import { GameSettings } from "src/shared/settings"
import { ClientState, NotifyTurnStartingPayload, Outfit } from 'src/shared/types'
import { eventBus } from 'src/shared/utils/eventBus'

import { CameraController } from 'src/client/cameraController'
import { ClientEvents } from 'src/client/clientEvents'
import { ClientStore } from 'src/client/clientStore'


export namespace StageController {

	// MARK: Event bindings
	eventBus.on(ClientEvents.NOTIFY_EMOTE, ({ userId: userId, emote: emote }) => {
		HandleEmotes(userId, emote)
	})

	// MARK: Vars
	const clientStore = ClientStore.getInstance()
	var goLeft = true
	let npcs: { userId: string, npc: Entity }[] = [] // Maps userId to npc entity

	// Waypoint vars
	const NPC_SPAWN_SCALE               = Vector3.create(1, 1, 1)
	const NPC_SPAWN_ROTATION            = Quaternion.fromEulerDegrees(0, 180, 0)

	const NPC_SPAWN_POSITION            = Vector3.create(16, 16.24, 31.25)
	const NPC_PATH_TOP_PAUSE            = Vector3.create(16, 16.24, 29)
	const NPC_PATH_TOP_STAIRS_TOP       = Vector3.create(16, 16.24, 28.51)
	const NPC_PATH_TOP_STAIRS_BOTTOM    = Vector3.create(16, 13.385, 25.67)
	
	const NPC_PATH_STAIRS_MID_PAUSE     = Vector3.create(16, 13.385, 24.76)
	const NPC_PATH_BOTTOM_STAIRS_TOP    = Vector3.create(16, 13.385, 23.67)
	const NPC_PATH_BOTTOM_STAIRS_BOTTOM = Vector3.create(16, 10.53, 20.83)

	const NPC_PATH_CATWALK_MIDPOINT     = Vector3.create(16, 10.53, 17.5)
	const NPC_PATH_CATWALK_JUNCTION     = Vector3.create(16, 10.53, 12.07)

	const NPC_PATH_EXIT_LEFT            = Vector3.create(3.76,  10.53, 12.07)
	const NPC_PATH_EXIT_RIGHT           = Vector3.create(28.24, 10.53, 12.07)

	// MARK: Waypoints
	type waypoint = {
		start?   : Vector3,
		end?     : Vector3,
		duration?: number,
		distance?: number
	}

	function GetWaypointData(goLeft: boolean = true): waypoint[] {

		const startTime = Date.now()
		
		var waypoints: waypoint[] = [
			{ // Spawn at the spawn position and walk to top balcony
				start: NPC_SPAWN_POSITION,
				end: NPC_PATH_TOP_PAUSE,
			},
			{ // Pause at the top of the stairs
				duration: 2500,
			},
			{ // Walk to the top of the stairs
				end: NPC_PATH_TOP_STAIRS_TOP,
			},
			{ // Walk down the stairs to the MID_PAUSE
				end: NPC_PATH_TOP_STAIRS_BOTTOM,
			},
			{ // Walk to MID_PAUSE
				end: NPC_PATH_STAIRS_MID_PAUSE
			},
			{ // Pause at MID_PAUSE
				duration: 2500,
			},
			{ // Walk to top of bottom stairs
				end: NPC_PATH_BOTTOM_STAIRS_TOP
			},
			{ // Walk to bottom of bottom stairs
				end: NPC_PATH_BOTTOM_STAIRS_BOTTOM
			},
			{ // Walk to catwalk mid
				end: NPC_PATH_CATWALK_MIDPOINT
			},
			{ // Pause at catwalk mid
				duration: 2500,
			},
			{ // Walk to catwalk junction
				end: NPC_PATH_CATWALK_JUNCTION
			},
			{ // Pause at catwalk junction
				duration: 2500,
			},
			{ // Walk to exit
				end: goLeft ? NPC_PATH_EXIT_LEFT : NPC_PATH_EXIT_RIGHT
			}
		]

		// Get the total value of specified durations
		const totalSetDurations = waypoints.reduce((acc, w) => acc + (w.duration ?? 0), 0)
		console.log("StageController: BuildWaypointData(): totalSetDurations", totalSetDurations)

		// Work out how much duration we have to distribute to the waypoints
		const remainingDuration = GameSettings.ROUND_DURATION_PER_PLAYER - totalSetDurations
		console.log("StageController: BuildWaypointData(): remainingDuration", remainingDuration)

		// Fill in the start and end positions, calculate their distances
		var lastPosition: Vector3 = Vector3.Zero()
		for (let w of waypoints) {
			if (!w.start) w.start = lastPosition
			if (!w.end) w.end = w.start
			if (!w.distance) w.distance = Vector3.distance(w.start, w.end)
			lastPosition = w.end!
		}

		const totalDistance = waypoints.reduce((acc, w) => acc + (w.distance ?? 0), 0)
		console.log("StageController: BuildWaypointData(): totalDistance", totalDistance)

		for (let w of waypoints) {
			if (!w.duration) {
				w.duration = remainingDuration * w.distance! / totalDistance
			}
			console.log("StageController: BuildWaypointData(): w.duration", w.duration)
		}

		const endTime = Date.now()
		console.log("StageController: BuildWaypointData(): Time Taken to build waypoints: ", endTime - startTime, "ms")
		return waypoints
	}


	// MARK: init
	export function init() {
		console.log("StageController: init()")

		eventBus.on(ClientEvents.NOTIFY_EMOTE, ({player, emote}) => {
			HandleEmotes(player, emote)
		})
		eventBus.on(ClientEvents.NOTIFY_TURN_STARTING, (data: NotifyTurnStartingPayload) => {
			console.log("StageController: NOTIFY_TURN_STARTING: data", data)
			StartTurn(data)
		})
		eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
			if (data.serverStatus == GameStatus.GAME_ENDED) {
				CleanupReset()
			}
		})
		eventBus.on(ClientEvents.NOTIFY_ABORT_GAME, (data) => {
			CleanupReset()
		})
	}

	// MARK: CleanupReset
	function CleanupReset() {
		console.log("StageController: CleanupReset()")

		// Remove all the NPC entities
		npcs.forEach((npc: { userId: string, npc: Entity }) => {
			console.log("StageController: OnShowEnd(): destroying npc:", npc.toString())
			DestroyNPC(npc.npc)
		})

		npcs = []

		CameraController.ResetCamera()
	}


	// MARK: StartTurn
	function StartTurn(data: NotifyTurnStartingPayload) {
		console.log("StageController: StartTurn(): outfit", data)

		// Create the NPC
		const npc = CreateNPC(data.outfit, data.displayName)
		if (!npc) {
			console.error("StageController RunShow(): Failed to create NPC clone for user", data.outfit.userId)
			return
		}
		npcs.push({ userId: data.outfit.userId, npc })

		// Create the camera target
		const npcCameraTarget = engine.addEntity()
		Transform.create(npcCameraTarget, {
			position: Vector3.create(0, 1, 0),
			parent: npc
		})

		// Track with the camera
		CameraController.TrackEntity(npcCameraTarget)

		// Trigger the NPC to walk
		const waypoints = GetWaypointData(goLeft)
		AnimateNPC(npc, waypoints)


		// Flip the flag
		goLeft = !goLeft
	}


	// MARK: CreateNPC
	function CreateNPC(outfit: Outfit, displayName: string): Entity | undefined {
		console.log("StageController: CreateNPCClone(): userId", outfit.userId)

		// Fetch the userData
		// TODO: remove this, add eyecolor as a property of the outfit
		let userData = getPlayer({ userId: outfit.userId })
		console.log(userData)	  
		if (!userData || !userData.wearables) return
		
		// Spawn the Avatar
		const npc = engine.addEntity()

		// the avatars wearables are in the outfit array, so we need to get the wearables from the outfit
		AvatarShape.create(npc, {
			id       : "npc_" + outfit.userId + "    ",
			name     : displayName,
			bodyShape: outfit.bodyShape,
			wearables: outfit.wearables ?? [],
			emotes   : userData.emotes,
			eyeColor : userData.avatar!.eyesColor || Color3.create(0.5, 0.5, 0.5),
			skinColor: outfit.skinColor,
			hairColor: outfit.hairColor
		})

		// Position the Avatar
		Transform.create(npc, {
			position: NPC_SPAWN_POSITION,
			rotation: NPC_SPAWN_ROTATION,
			scale   : NPC_SPAWN_SCALE
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
	}


	// MARK: AnimateNPC
	function AnimateNPC(
		npc: Entity, 
		waypoints: waypoint[]
	) {
		console.log("StageController: AnimateNPC(): npc", npc)

		const sequence = waypoints.map((w) => {
			return {
				duration: w.duration!,
				easingFunction: EasingFunction.EF_LINEAR,
				mode: Tween.Mode.Move({
					start: w.start!,
					end: w.end!,
				}),
			}
		})
		// Remove the first waypoint from the sequence
		sequence.shift()


		Tween.setMove(npc, 
			waypoints[0].start!, 
			waypoints[0].end!, 
			waypoints[0].duration!
		)

		TweenSequence.create(npc, {
			sequence: sequence,
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


	// MARK: HandleEmotes
	function HandleEmotes(userId: string, emoteUrn: string | undefined) {
		if (clientStore.getCurrentTurnUserId() !== userId) {
			return
		}
		
		console.log("StageController: HandleEmotes(): userId", userId, "emote", emoteUrn)
		const npc = npcs.find((npc: { userId: string, npc: Entity }) => npc.userId === userId)?.npc
		if (npc) {
			const avatarShape = AvatarShape.getMutableOrNull(npc)
			if (avatarShape) {
				avatarShape.expressionTriggerId = emoteUrn
				avatarShape.expressionTriggerTimestamp = (avatarShape.expressionTriggerTimestamp ?? 0) + 1
			}
		}
	}
}
