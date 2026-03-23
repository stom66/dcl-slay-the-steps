/**
 * Lambdas profile JSON (any userId) + small caches for display name and face256 URL.
 * Omit userId to use the local player from getPlayer().
 */

import { getPlayer, onEnterScene } from '@dcl/sdk/players'
import type { DecentralandProfile } from '../types/lambdasProfileTypes'

export type { DecentralandProfile }

const PROFILE_URL = 'https://peer.decentraland.org/lambdas/profiles/'

const profileCache = new Map<string, DecentralandProfile>()
const faceUrlCache = new Map<string, string>()
const pendingFetch = new Map<string, Promise<DecentralandProfile | null>>()

let cachedLocalUserId = ''


function localUserId(): string {
	if (!cachedLocalUserId) {
		cachedLocalUserId = getPlayer()?.userId?.trim() ?? ''
	}
	return cachedLocalUserId
}

function resolveUserId(userId?: string | null): string {
	if (userId != null && userId.trim() !== '') {
		return userId.trim()
	}
	return localUserId()
}

function displayName(data: DecentralandProfile | undefined): string {
	return data?.avatars?.[0]?.name?.trim() ?? ''
}

function face256Url(data: DecentralandProfile | undefined): string | undefined {
	const u = data?.avatars?.[0]?.avatar?.snapshots?.face256
	return typeof u === 'string' ? u : undefined
}

function putProfile(userId: string, data: DecentralandProfile): void {
	profileCache.set(userId, data)
	const url = face256Url(data)
	if (url) {
		faceUrlCache.set(userId, url)
	}
}

onEnterScene((player) => {
	if (!player) return
	void fetchUserProfile(player.userId)
})

export function getUserId(): string {
	return localUserId()
}

/**
 * Display name from profileCache. If missing, starts fetchUserProfile and returns "" until cached.
 */
export function getUsername(userId?: string | null): string {
	const id = resolveUserId(userId)
	if (!id) {
		return ''
	}
	const data = profileCache.get(id)
	if (!data) {
		void fetchUserProfile(id)
		return ''
	}
	return displayName(data)
}

export async function fetchUserProfile(userId?: string | null): Promise<DecentralandProfile | null> {
	const id = resolveUserId(userId)
	if (!id) {
		return null
	}

	const hit = profileCache.get(id)
	if (hit !== undefined) {
		return hit
	}

	const pending = pendingFetch.get(id)
	if (pending) {
		return pending
	}

	const promise = (async (): Promise<DecentralandProfile | null> => {
		try {
			const response = await fetch(PROFILE_URL + id)
			if (!response.ok) {
				console.error('fetchUserProfile: response not ok', response.statusText)
				return null
			}
			const data = (await response.json()) as DecentralandProfile
			putProfile(id, data)
			return data
		} catch (err) {
			console.error('fetchUserProfile: failed for', id, err)
			return null
		} finally {
			pendingFetch.delete(id)
		}
	})()

	pendingFetch.set(id, promise)
	return promise
}

/**
 * face256 URL from faceUrlCache. If missing, starts fetchUserProfile and returns "" until cached.
 */
export function getUserAvatarUrl(userId?: string | null): string {
	const id = resolveUserId(userId)
	if (!id) {
		return ''
	}
	const url = faceUrlCache.get(id)
	if (url) {
		return url
	}
	void fetchUserProfile(id)
	return ''
}
