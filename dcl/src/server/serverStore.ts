import { GameStatus } from "src/shared/enums"
import { Outfit, ServerState } from "src/shared/types"

export class ServerStore {
	private static instance: ServerStore | undefined

	private readonly serverState: ServerState = {
		gameStartTime: 0,
		outfits      : new Map<string, Outfit>(),
		players      : new Map<string, string>(),
		status      : GameStatus.LOBBY,
		votes        : new Map<string, string>(),
	}

	private constructor() {
		console.log('ServerStore: constructor')
	}

	static getInstance(): ServerStore {
		if (!ServerStore.instance) ServerStore.instance = new ServerStore()
		return ServerStore.instance
	}

	getState(): Readonly<ServerState> {
		return this.serverState
	}

	resetState(): void {
		this.serverState.status        = GameStatus.LOBBY
		this.serverState.gameStartTime = 0
		this.serverState.outfits       = new Map<string, Outfit>()
		this.serverState.players       = new Map<string, string>()
		this.serverState.votes         = new Map<string, string>()
	}

	setStatus(status: GameStatus): void {
		this.serverState.status = status
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

	removePlayer(userId: string): boolean {
		if (!this.serverState.players.has(userId)) {
			console.log(`serverStore: removePlayer: userId ${userId} is not present in players map.`)
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