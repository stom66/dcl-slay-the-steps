import { GameStatus } from "src/shared/enums"
import { GameSettings } from "src/shared/settings"
import { Outfit, ServerState } from "src/shared/types"

import { gameManager } from "src/server/gameManager"
import { sendStateUpdate } from "src/server/serverMessaging"


// MARK: ServerStore
export class ServerStore {
	private static instance: ServerStore | undefined

	private readonly serverState: ServerState = {
		currentTurnUserId: "",
		gameStartTime    : 0,
		outfits          : new Map<string, Outfit>(),
		players          : new Map<string, string>(),
		status           : GameStatus.LOBBY,
		votes            : new Map<string, string>(),
	}

	private constructor() {
		console.log('ServerStore: constructor')
	}

	
	// MARK: Instance
	static getInstance(): ServerStore {
		if (!ServerStore.instance) ServerStore.instance = new ServerStore()
		return ServerStore.instance
	}


	// MARK: GetState
	getState(): Readonly<ServerState> {
		return this.serverState
	}


	// MARK: ResetState
	resetState(): void {
		this.serverState.status        = GameStatus.LOBBY
		this.serverState.gameStartTime = 0
		this.serverState.outfits       = new Map<string, Outfit>()
		this.serverState.players       = new Map<string, string>()
		this.serverState.votes         = new Map<string, string>()
	}


	// MARK: Status
	setStatus(status: GameStatus): void {
		this.serverState.status = status
	}
		getStatus(): GameStatus {
			return this.serverState.status
		}


	// MARK: Outfits
	setPlayerOutfit(userId: string, outfit: Outfit): void {
		// Check if the userId is present in the players array and the outfits map; fail gracefully if not
		if (!this.serverState.players.has(userId)) {
			console.log(`serverStore: setPlayerOutfit: userId ${userId} is not present in players array.`)
			return
		}
		this.serverState.outfits.set(userId, { ...outfit })
	}


	// MARK: Players
	addPlayer(userId: string, displayName: string, outfit: Outfit): void {
		console.log(`serverStore: addPlayer: adding userId ${userId} to players map.`)
		this.serverState.players.set(userId, displayName)
		this.setPlayerOutfit(userId, outfit)
	}

	getPlayerCount(): number {
		return this.serverState.players.size
	}

	getPlayerIDs(): string[] {
		return Array.from(this.serverState.players.keys())
	}

	removePlayer(userId: string): void {
		if (!this.serverState.players.has(userId)) {
			console.log(`serverStore: removePlayer: userId ${userId} is not present in players map.`)
		}
		this.serverState.players.delete(userId)
		this.serverState.outfits.delete(userId)

		if (this.getPlayerCount() < 1) {
			if (this.getStatus() !== GameStatus.STARTING) {
				this.setStatus(GameStatus.LOBBY)
				sendStateUpdate()
			} else  {
				gameManager.abortGame()
			}
		}
	}


	// MARK: Votes
	addVote(voteFrom: string, voteFor: string): void {
		this.serverState.votes.set(voteFrom, voteFor)
	}

	removeVote(voteFrom: string): void {
		this.serverState.votes.delete(voteFrom)
	}

	getVoteResults(): { userId: string, voteFor: string }[] {
		return Array.from(this.serverState.votes.entries()).map(([userId, voteFor]) => ({
			userId    : userId,
			voteFor   : voteFor,
		}))
	}

	resetVotes(): void {
		this.serverState.votes = new Map<string, string>()
	}


	// MARK: Game Start Time
	setGameStartTime(gameStartTime: number): void {
		this.serverState.gameStartTime = gameStartTime
	}


	// MARK: Current Turn User ID
	setCurrentTurnUserId(userId: string): void {
		this.serverState.currentTurnUserId = userId
	}
		getCurrentTurnUserId(): string | undefined {
			return this.serverState.currentTurnUserId
		}
}
