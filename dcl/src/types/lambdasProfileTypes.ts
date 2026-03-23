/**
 * Wire types for Decentraland catalyst lambdas profile JSON.
 * Matches GET /lambdas/profiles/{id} (and the legacy /profile/{id} alias).
 * OpenAPI describes `avatar` loosely as object; this types the fields commonly present.
 * @see https://docs.decentraland.org/apis/apis/lamb2/profiles
 */

/** RGBA components 0–1 as returned on profile payloads */
export type LambdasProfileColor = {
	r: number
	g: number
	b: number
	a: number
}

/** Snapshot URLs when the catalyst has generated them; often `{}` until available. */
export type LambdasProfileAvatarSnapshots = {
	face256?: string
	face128?: string
	body?   : string
}

export type LambdasProfileAvatar = {
	bodyShape  : string
	wearables  : string[]
	forceRender: string[]
	emotes     : unknown[]
	eyes?      : { color?: LambdasProfileColor }
	hair?      : { color?: LambdasProfileColor }
	skin?      : { color?: LambdasProfileColor }
	snapshots? : LambdasProfileAvatarSnapshots
}

/**
 * One element of the root `avatars` array: account-level fields plus nested `avatar` appearance.
 * Optional fields may be missing on older or sparse profiles.
 */
export type LambdasProfileAvatarRecord = {
	userId             : string
	avatar             : LambdasProfileAvatar
	hasClaimedName?    : boolean
	description?       : string
	tutorialStep?      : number
	name?              : string
	email?             : string
	ethAddress?        : string
	version?           : number
	unclaimedName?     : string
	hasConnectedWeb3?  : boolean
	country?           : string
	gender?            : string
	pronouns?          : string
	relationshipStatus?: string
	sexualOrientation? : string
	language?          : string
	employmentStatus?  : string
	profession?        : string
	realName?          : string
	hobbies?           : string
	birthDate?         : number
	links?             : unknown[]
	blocked?           : unknown[]
	interests?         : string[]
	nameColor?         : LambdasProfileColor
}

/** JSON body from GET https://peer.decentraland.org/lambdas/profiles/{address} */
export type DecentralandProfile = {
	/** Present on current catalyst responses; omit if using a minimal client. */
	timestamp?: number
	avatars   : LambdasProfileAvatarRecord[]
}
