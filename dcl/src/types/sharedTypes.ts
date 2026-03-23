import { GameStatus } from "../utils/enums"

export type Outfit = {
	userId   : string
	wearables: string[]
	bodyShape: string
	hairColor: string
	skinColor: string
}

export type ClientState = {
	userId: string
	outfit: Outfit
}

export type ServerState = {
	gameStartTime: number,
	outfits      : Map<string, Outfit>, // userId -> outfit
	players      : Map<string, string>, // userId -> displayName
	serverTime   : number,
	status       : GameStatus,
	votes        : Map<string, string>, // voteFrom -> voteFor
}