/**
 * Profile cache + lambdas fetch. Omit userId to use the local player once getPlayer() is valid.
 */

import { getPlayer, onEnterScene } from '@dcl/sdk/players'
import type { DecentralandProfile } from '../types'
import { engine } from '@dcl/sdk/ecs'

const PROFILE_URL = 'https://peer.decentraland.org/lambdas/profiles/'


class UserProfileCache {
	private cache = new Map<string, DecentralandProfile>()
	private inFlight = new Map<string, Promise<DecentralandProfile | null>>()

	private localUserId: string | undefined
	private isInitialised = false
	private initPromise: Promise<void> | null = null

	constructor() {}

	async init(): Promise<void> {
		if (this.isInitialised) return
		if (this.initPromise) return this.initPromise
	
		console.log('UserProfileCache: init')
	
		this.initPromise = (async () => {
			try {
				// Wait deterministically for local player
				this.localUserId = await this.waitForLocalPlayer()
	
				this.isInitialised = true
	
				// Prefetch local profile
				void this.getUserProfile()
	
				// Cache profiles for players entering scene
				onEnterScene((player) => {
					if (!player) return
					void this.getUserProfile(player.userId)
				})
			} catch (error) {
				console.error('UserDataCache: init failed', error)
			}
		})()
	
		return this.initPromise
	}

	waitForLocalPlayer(): Promise<string> {
		return new Promise((resolve) => {
			const system = () => {
				const player = getPlayer()
		
				if (player?.userId) {
					engine.removeSystem(system)
					resolve(player.userId)
				}
			}
		
			engine.addSystem(system)
		})
	}

	async getUserProfile(userId?: string | null): Promise<DecentralandProfile | null> {
		if (!this.isInitialised) await this.init()

		userId = userId ?? this.localUserId
		if (!userId) {
			console.error('UserDataCache: getUserProfile: no userId')
			return null
		}

		// Check for cache hit
		if (this.cache.has(userId)) {
			return this.cache.get(userId)!
		}

		// Check for in-flight request
		if (this.inFlight.has(userId)) {
			return this.inFlight.get(userId)!
		}
		
		// Create new fetch promise
		const request = this.fetchProfile(userId)
		this.inFlight.set(userId, request)

		// Store the result
		try {
			const result = await request
			if (result) {
				this.cache.set(userId, result)
				console.log('UserProfileCache: getUserProfile: got profile for', userId)
				return result
			}
			return null
		} finally {
			this.inFlight.delete(userId)
		}

	}

	async getUserAvatarUrl(userId?: string | null): Promise<string> {
		const id = userId ?? this.localUserId
		if (!id) return ''

		const profile = await this.getUserProfile(id)
		const avatarUrl = profile?.avatars?.[0]?.avatar?.snapshots?.face256
		return typeof avatarUrl === 'string' ? avatarUrl : ''
	}

	private async fetchProfile(userId: string): Promise<DecentralandProfile | null> {
		try {
			const response = await fetch(PROFILE_URL + userId)
			if (!response.ok) {
				console.error('UserDataCache: getUserProfile: response not ok', response.statusText)
				return null
			}

			const data: DecentralandProfile = await response.json()

			// Ensure avatar data exists
			if (!data || !Array.isArray(data.avatars) || data.avatars.length === 0) {
				console.error('UserDataCache: getUserProfile: no avatar data', data)
				return null
			}

			return data
		}
		catch (error) {
			console.error('UserDataCache: getUserProfile: failed to fetch profile', error)
			return null
		}
	}
}

export const userProfileCache = new UserProfileCache()