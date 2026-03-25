import { Wearable } from "src/client/data/shopSlotData"
import { GameStatus } from "./enums"
import { Color3 } from "@dcl/sdk/math"

export type Outfit = {
	userId: string
	wearables: Wearable[]
	bodyShape: string
	hairColor: string
	skinColor: string
}

export type ClientState = {
	userId          : string
	displayName     : string
	//outfit          : Outfit
	playerBodyShape : string
	playerSkinColor : Color3
	playerHairColor : Color3
	playerWearables: Wearable[]

	npcSkinColor    : Color3
	npcHairColor    : Color3
	npcBodyShape    : string
	npcWearables    : Wearable[]
}

export type ServerState = {
	gameStartTime: number,
	outfits      : Map<string, Outfit>, // userId -> outfit
	players      : Map<string, string>, // userId -> displayName
	serverTime   : number,
	status       : GameStatus,
	votes        : Map<string, string>, // voteFrom -> voteFor
}

// room message payloads

export type NotifyPlayerListPayload = {
	players: {
		userId: string
		displayName: string
	}[]
}

export type NotifyStatePayload = {
	status: string
	outfits?: {
		userId: string
		wearables: string[]
		bodyShape: string
		hairColor: string
		skinColor: string
	}[]
	players: NotifyPlayerListPayload['players']
}






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
