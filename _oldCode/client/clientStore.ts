import { fetchUserProfile } from 'src/_oldCode/shared/userData'
import { ClientState, Outfit, ServerState } from 'src/_oldCode/shared/types'
import { GameStatus } from './gameManager'


export class ClientStore {
	// MARK: Singleton
	private static instance: ClientStore | undefined

	// MARK: State
	private clientState: ClientState = {
		userId     : '',
		displayName: '',
		outfit     : {
			wearables: [],
			bodyShape: '',
			hairColor: '',
			skinColor: ''
		}
	}

	private serverState: ServerState = {
		status       : GameStatus.IDLE,
		gameStartTime: 0,
		outfits      : new Map<string, Outfit>(),
		players      : new Map<string, string>(),
		serverTime   : 0,
		votes        : new Map<string, string>(),
	}
	
	private constructor() {
		void this.initialize()
	}

	private async initialize(): Promise<void> {
		const data = await fetchUserProfile()
		if (!data) {
			console.error('ClientStore: fetchUserProfile: no data')
			return
		}
		const record = data.avatars?.[0]
		if (!record || !record.name || !record.userId) {
			console.error('ClientStore: fetchUserProfile: no record/name/userId')
			return
		}

		this.clientState.userId = record.userId
		this.clientState.displayName = record.name
	}

	// MARK: getInstance
	static getInstance(): ClientStore {
		if (!ClientStore.instance) ClientStore.instance = new ClientStore()
		return ClientStore.instance
	}

	// MARK: getState
	getClientState(): ClientState {
		return this.clientState
	}

	getServerState(): ServerState {
		return this.serverState
	}

	setServerState(state: ServerState): void {
		this.serverState = state
	}
	
	// MARK: setUserId
	//setUserId(userId: string): void {
	//	this.clientState.userId = userId
	//}
	
	// MARK: setOutfit
	setOutfit(outfit: Outfit): void {
		this.clientState.outfit = outfit
	}
}

// MARK: getClientStore
export function getClientStore(): ClientStore {
	return ClientStore.getInstance()
}
