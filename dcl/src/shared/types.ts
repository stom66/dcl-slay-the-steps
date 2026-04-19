import { Color3 } from "@dcl/sdk/math"

import { GameStatus, PlayerStats } from "src/shared/enums"

// MARK: Wearable
export type Wearable = {
	urn            : string,
	bodyShapes     : string[], // These are all "optional", as the built-in items don't have them
	category       : string,   // 
	contractAddress: string,   // 
	name           : string,   // 
	rarity         : string,   // 
	creator?       : string,   // Optional, added later, not yet added to the default items
	description?   : string,   // Optional, added later, not yet added to the default items
}

// MARK: Outfit
export type Outfit = {
	userId   : string
	wearables: string[]
	bodyShape: string
	hairColor: Color3
	skinColor: Color3
}

// MARK: PlayerStatsRecord
export type PlayerStatsRecord = Record<PlayerStats, number>


// MARK: ClientState
export type ClientState = {
	userId                : string
	displayName           : string
	enrolledInGame        : boolean
	spectatorInGame       : boolean
	currentTurnUserId     : string | undefined
	voteResults           : Map<string, string>

	gameStartTime         : number
	serverStatus          : GameStatus
	playersInGame         : Map<string, string>
	spectatorsInGame      : Map<string, string>

	playerBodyShape       : string
	playerSkinColor       : Color3
	playerHairColor       : Color3
	playerWearables       : Wearable[]

	npcSkinColor          : Color3
	npcHairColor          : Color3
	npcBodyShape          : string
	npcWearables          : Wearable[]

	lastWinner            : {
		userId               : string
		displayName          : string
		outfit               : Outfit
	} | undefined
}


// MARK: ServerState
export type ServerState = {
	gameStartTime    : number,
	outfits          : Map<string, Outfit> // userId -> outfit
	players          : Map<string, string> // userId -> displayName
	spectators       : Map<string, string> // userId -> displayName
	status           : GameStatus
	votes            : Map<string, string> // voteFrom -> voteFor
	currentTurnUserId: string | undefined
	lastWinner       : {
		userId     : string
		displayName: string
		outfit     : Outfit
	} | undefined
}


// MARK: NotifyPlayerListPayload
export type NotifyPlayerListPayload = {
	sentAt : number
	players: {
		userId     : string
		displayName: string
	}[]
}


// MARK: NotifyStatePayload
export type NotifyStatePayload = {
	gameStartTime: number
	players      : NotifyPlayerListPayload['players']
	spectators   : NotifyPlayerListPayload['players']
	sentAt       : number
	status       : string
	voteResults  : {
		userId    : string
		voteFor   : string
	}[],
	lastWinner?: {
		userId     : string
		displayName: string
		outfit     : Outfit
	} | undefined
}


// MARK: NotifyTurnStartingPayload
export type NotifyTurnStartingPayload = {
	displayName: string
	outfit     : Outfit
	sentAt     : number
	userId     : string
}


// MARK: LambdasProfileColor
/** RGBA components 0–1 as returned on profile payloads */
export type LambdasProfileColor = {
	r: number
	g: number
	b: number
	a: number
}


// MARK: LambdasProfileAvatarSnapshots
/** Snapshot URLs when the catalyst has generated them; often `{}` until available. */
export type LambdasProfileAvatarSnapshots = {
	face256?: string
	face128?: string
	body?   : string
}


// MARK: LambdasProfileAvatar
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


// MARK: LambdasProfileAvatarRecord
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


// MARK: DecentralandProfile
/** JSON body from GET https://peer.decentraland.org/lambdas/profiles/{address} */
export type DecentralandProfile = {
	/** Present on current catalyst responses; omit if using a minimal client. */
	timestamp?: number
	avatars   : LambdasProfileAvatarRecord[]
}
