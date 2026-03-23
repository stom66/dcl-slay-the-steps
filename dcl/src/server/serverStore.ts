import { GameStatus } from "src/utils/enums"
import { Outfit, ServerState } from "src/types/sharedTypes"

export class ServerStore {
	private static instance: ServerStore | undefined

	private readonly serverState: ServerState = {
		status      : GameStatus.IDLE,
		gameStartTime: 0,
		outfits      : new Map(),
		players      : new Map(),
		serverTime   : 0,
		votes        : new Map(),
	}

	private constructor() {}

	static getInstance(): ServerStore {
		if (!ServerStore.instance) ServerStore.instance = new ServerStore()
		return ServerStore.instance
	}

	getState(): Readonly<ServerState> {
		return this.serverState
	}

	setState(status: GameStatus): void {
		this.serverState.status = status
	}

	// MARK: Outfits
	setPlayerOutfit(userId: string, outfit: Outfit): void {
		// Check if the userId is present in the players array and the outfits map; fail gracefully if not
		if (!this.serverState.players.has(userId)) {
			console.log(`setPlayerOutfit: userId ${userId} is not present in players array.`)
			return
		}
		this.serverState.outfits.set(userId, { ...outfit })
	}

	// MARK: Players
	addPlayer(userId: string, displayName: string, outfit: Outfit): void {
		if (this.serverState.status === GameStatus.IDLE || this.serverState.status === GameStatus.STARTING) {
			console.log(`addPlayer: adding userId ${userId} to players map.`)
			this.serverState.players.set(userId, displayName)
			this.setPlayerOutfit(userId, outfit)
			return
		}
	}

	removePlayer(userId: string): boolean {
		if (!this.serverState.players.has(userId)) {
			console.log(`removePlayer: userId ${userId} is not present in players map.`)
			return false
		}
		this.serverState.players.delete(userId)
		this.serverState.outfits.delete(userId)
		return true
	}

	// MARK: Votes
	addVote(voteFrom: string, voteFor: string): void {
		this.serverState.votes.set(voteFrom, voteFor)
	}

	removeVote(voteFrom: string): void {
		this.serverState.votes.delete(voteFrom)
	}

	setGameStartTime(gameStartTime: number): void {
		this.serverState.gameStartTime = gameStartTime
	}
}