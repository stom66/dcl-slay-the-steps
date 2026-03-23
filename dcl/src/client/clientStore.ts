import { ClientState, Outfit } from 'src/types/sharedTypes'


export class ClientStore {
	// MARK: Singleton
	private static instance: ClientStore | undefined

	// MARK: State
	private readonly clientState: ClientState = {
		userId  : '',
		outfit  : {
			userId   : '',
			wearables: [],
			bodyShape: '',
			hairColor: '',
			skinColor: ''
		}
	}
	
	private constructor() {}

	// MARK: getInstance
	static getInstance(): ClientStore {
		if (!ClientStore.instance) ClientStore.instance = new ClientStore()
		return ClientStore.instance
	}

	// MARK: getState
	getState(): Readonly<ClientState> {
		return this.clientState
	}
	
	// MARK: setUserId
	setUserId(userId: string): void {
		this.clientState.userId = userId
	}
	
	// MARK: setOutfit
	setOutfit(outfit: Outfit): void {
		this.clientState.outfit = outfit
	}
}

// MARK: getClientStore
export function getClientStore(): ClientStore {
	return ClientStore.getInstance()
}
