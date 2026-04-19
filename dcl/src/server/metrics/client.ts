import { engine } from '@dcl/sdk/ecs'
import { onEnterScene } from '@dcl/sdk/players'
import { EnvVar } from '@dcl/sdk/server'

import { PlayerStats } from 'src/shared/enums'
import { GameSettings } from 'src/shared/settings'
import { PlayerStatsRecord } from 'src/shared/types'

import { VERSION } from 'src/client/data/version'

import { MetricEvents } from 'src/server/metrics/metricEvents'
import { Posthog } from 'src/server/metrics/posthog'


export namespace Metrics {
	// MARK: Vars
	const sessions    = new Map<string, number>()            // userId -> startTimestamp
	const playerStats = new Map<string, PlayerStatsRecord>() // userId -> session stats


	// MARK: Init
	export function init() {
		console.log('Metrics: init()')
		Posthog.init()
	}


	// MARK: Utils
	function userDistinctId(userId: string): string {
		return `user_${userId}`
	}

	function gameDistinctId(gameStartTime: number): string {
		return `game_${gameStartTime}`
	}

	function incrementPlayerStat(userId: string, stat: PlayerStats): void {
		let record = playerStats.get(userId)
		if (!record) {
			record = {
				[PlayerStats.GAMES_PLAYED]      : 0,
				[PlayerStats.GAMES_WON]         : 0,
				[PlayerStats.GAMES_SPECTATED]   : 0,
				[PlayerStats.GAMES_CREATED]     : 0,
				[PlayerStats.WEARABLES_EQUIPPED]: 0,
			}
			playerStats.set(userId, record)
		}
		record[stat]++
	}


	// MARK: Player: Session
	export function startSession(userId: string, displayName: string) {
		if (sessions.has(userId)) return

		sessions.set(userId, Date.now())

		trackSceneJoined(userId, displayName)
	}

	export function endSession(userId: string): void {
		const startTimestamp = sessions.get(userId)
		if (!startTimestamp) {
			return
		}

		const durationMs = Date.now() - startTimestamp
		const stats      = playerStats.get(userId)
		trackSceneLeft(userId, durationMs, stats)

		sessions.delete(userId)
		playerStats.delete(userId)

	}


	// MARK: Player: Scene
	export function trackSceneJoined(userId: string, displayName: string) {
		Posthog.identify(userDistinctId(userId), {
			$set: {
				displayName: displayName
			},
			$set_once: {
				walletAddress: userId
			}
		})

		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_SCENE_JOINED, {
			version              : VERSION,
			sessionStartTimestamp: sessions.get(userId)
		})
	}

	export function trackSceneLeft(userId: string, durationMs: number, playerStats?: PlayerStatsRecord) {
		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_SCENE_LEFT, {
			version              : VERSION,
			durationMs           : durationMs,
			sessionStartTimestamp: sessions.get(userId),
			...playerStats,
		})
	}


	// MARK: Player: Tutorial
	export function trackTutorialAborted(userId: string) {
		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_TUTORIAL_ABORTED, {
			version              : VERSION,
			sessionStartTimestamp: sessions.get(userId),
			tutorialElapsedTimeMs: Date.now() - (sessions.get(userId) ?? 0) - GameSettings.LOADING_SCREEN_DELAY
		})
	}
	
	export function trackTutorialCompleted(userId: string) {
		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_TUTORIAL_COMPLETED, {
			version              : VERSION,
			sessionStartTimestamp: sessions.get(userId)
		})
	}


	// MARK: Player: Game
	export function trackGameJoined(userId: string, gameStartTime: number) {
		incrementPlayerStat(userId, PlayerStats.GAMES_PLAYED)

		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_GAME_JOINED, {
			version              : VERSION,
			gameId               : gameDistinctId(gameStartTime),
			sessionStartTimestamp: sessions.get(userId)
		})
	}

	export function trackGameSpectated(userId: string, gameStartTime: number) {
		incrementPlayerStat(userId, PlayerStats.GAMES_SPECTATED)

		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_GAME_SPECTATED, {
			version              : VERSION,
			gameId               : gameDistinctId(gameStartTime),
			sessionStartTimestamp: sessions.get(userId)
		})
	}

	export function trackGameWon(userId: string, gameStartTime: number) {
		incrementPlayerStat(userId, PlayerStats.GAMES_WON)

		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_GAME_WON, {
			version              : VERSION,
			gameId               : gameDistinctId(gameStartTime),
			sessionStartTimestamp: sessions.get(userId)
		})
	}

	export function trackGameNotWon(userId: string, gameStartTime: number) {
		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_GAME_NOT_WON, {
			version              : VERSION,
			gameId               : gameDistinctId(gameStartTime),
			sessionStartTimestamp: sessions.get(userId)
		})
	}

	export function trackVoteCast(userId: string, votedForUserId: string, gameStartTime: number) {
		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_VOTE_CAST, {
			version              : VERSION,
			gameId               : gameDistinctId(gameStartTime),
			votedForUserId       : votedForUserId,
			sessionStartTimestamp: sessions.get(userId)
		})
	}


	// MARK: Player: Emote
	export function trackPlayerEmote(gameStartTime: number, userId: string, emote: string) {
		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_EMOTED, {
			version              : VERSION,
			gameId               : gameDistinctId(gameStartTime),
			emote                : emote,
			sessionStartTimestamp: sessions.get(userId)
		})
	}


	// MARK: Player: Equips
	export function trackEquippedWearable(userId: string, wearableUrn: string) {
		incrementPlayerStat(userId, PlayerStats.WEARABLES_EQUIPPED)
		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_EQUIPPED_WEARABLE, {
			version              : VERSION,
			wearableUrn          : wearableUrn,
			sessionStartTimestamp: sessions.get(userId)
		})
	}

	export function trackEquippedSkinColor(userId: string, color: string) {
		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_EQUIPPED_COLOR_SKIN, {
			version              : VERSION,
			color                : color,
			sessionStartTimestamp: sessions.get(userId)
		})
	}

	export function trackEquippedHairColor(userId: string, color: string) {
		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_EQUIPPED_COLOR_HAIR, {
			version              : VERSION,
			color                : color,
			sessionStartTimestamp: sessions.get(userId)
		})
	}


	// MARK: Game
	export function trackGameCreated(userId: string, gameStartTime: number) {
		incrementPlayerStat(userId, PlayerStats.GAMES_CREATED)
		Posthog.capture(gameDistinctId(gameStartTime), MetricEvents.GAME_CREATED, {
			version        : VERSION,
			gameStartTime  : gameStartTime,
			createdByUserId: userId,
		})

		Posthog.capture(userDistinctId(userId), MetricEvents.PLAYER_GAME_CREATED, {
			version              : VERSION,
			gameId               : gameDistinctId(gameStartTime),
			sessionStartTimestamp: sessions.get(userId)
		})
	}

	export function trackGameStarted(gameStartTime: number, playerIds: string[]) {
		Posthog.capture(gameDistinctId(gameStartTime), MetricEvents.GAME_STARTED, {
			version    : VERSION,
			playerCount: playerIds.length,
			playerIds  : playerIds
		})
	}

	export function trackGameEnded(gameStartTime: number, playerIds: string[], winnerUserId: string | undefined) {
		Posthog.capture(gameDistinctId(gameStartTime), MetricEvents.GAME_ENDED, {
			version     : VERSION,
			playerCount : playerIds.length,
			playerIds   : playerIds,
			winnerUserId: winnerUserId,
			durationMs  : Date.now() - gameStartTime
		})
	}

	export function trackGameAborted(gameStartTime: number) {
		Posthog.capture(gameDistinctId(gameStartTime), MetricEvents.GAME_ABORTED, {
			version      : VERSION,
			gameStartTime: gameStartTime,
			durationMs   : Date.now() - gameStartTime
		})
	}
}
