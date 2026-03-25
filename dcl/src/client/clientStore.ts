import { Color3 } from '@dcl/sdk/math'
import { userProfileCache } from '../shared/utils/userProfileCache'
import { ClientState, ServerState, Outfit } from '../shared/types'
import { GameStatus } from '../shared/enums'
import { Wearable } from './data/shopSlotData'

export class ClientStore {
	// MARK: Singleton
	private static instance: ClientStore | undefined

	// MARK: State
	private clientState: ClientState = {
		userId         : '',
		displayName    : '',
		
		playerBodyShape: '',
		playerHairColor: Color3.Red(),
		playerSkinColor: Color3.Red(),
		playerWearables: [] as Wearable[],

		npcBodyShape   : '',
		npcHairColor   : Color3.Green(),
		npcSkinColor   : Color3.Green(),
		npcWearables   : [] as Wearable[]
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
		console.log('ClientStore: constructor')
	}

	async init(): Promise<void> {
		console.log('ClientStore: init')
		const data = await userProfileCache.getUserProfile()
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

		console.log('ClientStore: fetchUserProfile: success. userId:', this.clientState.userId, 'displayName:', this.clientState.displayName)
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


	setServerState(state: ServerState): void {
		this.serverState = state
	}
		getServerState(): ServerState {
			return this.serverState
		}


	getUserId(): string {
		return this.clientState.userId
	}

	// MARK: Player Properties
	setPlayerSkinColor(color: Color3): void {
		this.clientState.playerSkinColor = color
	}
		getPlayerSkinColor(): Color3 {
			return this.clientState.playerSkinColor
		}

	setPlayerHairColor(color: Color3): void {
		this.clientState.playerHairColor = color
	}
		getPlayerHairColor(): Color3 {
			return this.clientState.playerHairColor
		}

	setPlayerBodyShape(shape: string): void {
		this.clientState.playerBodyShape = shape
	}
		getPlayerBodyShape(): string {
			return this.clientState.playerBodyShape
		}

	setPlayerWearables(wearables: Wearable[]): void {
		this.clientState.playerWearables = wearables
	}
		getPlayerWearables(): Wearable[] {
			return this.clientState.playerWearables
		}
	

	// MARK: NPC Setters
	setNPCSkinColor(color: Color3): void {
		this.clientState.npcSkinColor = color
	}
		getNPCSkinColor(): Color3 {
			return this.clientState.npcSkinColor
		}

	setNPCHairColor(color: Color3): void {
		this.clientState.npcHairColor = color
	}
		getNPCHairColor(): Color3 {
			return this.clientState.npcHairColor
		}
	setNPCBodyShape(shape: string): void {
		this.clientState.npcBodyShape = shape
	}
		getNPCBodyShape(): string {
			return this.clientState.npcBodyShape
		}

	setNPCWearables(wearables: Wearable[]): void {
		this.clientState.npcWearables = wearables
	}
		getNPCWearables(): Wearable[] {
			return this.clientState.npcWearables
		}
}
