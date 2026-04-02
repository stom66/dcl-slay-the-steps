import { Color3 } from '@dcl/sdk/math'
import { userProfileCache } from '../shared/utils/userProfileCache'
import { ClientState, ServerState, Outfit } from '../shared/types'
import { GameStatus } from '../shared/enums'
import { Wearable } from './data/shopSlotData'
import { eventBus } from 'src/shared/utils/eventBus'
import { ClientEvents } from './clientEvents'
import { ClientMessaging } from './clientMessaging'

// MARK: ClientStore
export class ClientStore {
	private static instance: ClientStore | undefined

	private clientState: ClientState = {
		userId         : "",
		displayName    : "",
		enrolledInGame : false,
		
		playerBodyShape: "",
		playerHairColor: Color3.Red(),
		playerSkinColor: Color3.Red(),
		playerWearables: [] as Wearable[],

		npcBodyShape   : "",
		npcHairColor   : Color3.Green(),
		npcSkinColor   : Color3.Green(),
		npcWearables   : [] as Wearable[]
	}

	private serverState: ServerState = {
		status       : GameStatus.LOBBY,
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

	// MARK: Instance
	static getInstance(): ClientStore {
		if (!ClientStore.instance) ClientStore.instance = new ClientStore()
		return ClientStore.instance
	}



	// MARK: ClientState
	getClientState(): ClientState {
		return this.clientState
	}

	setEnrolledInGame(enrolled: boolean): void {
		this.clientState.enrolledInGame = enrolled
	}
		isEnrolledInGame(): boolean {
			return this.clientState.enrolledInGame
		}



	// MARK: ServerState
	setServerState(state: ServerState): void {
		this.serverState = state
	}
		getServerState(): ServerState {
			return this.serverState
		}

	setGameStartTime(gameStartTime: number): void {
		this.serverState.gameStartTime = gameStartTime
	}
		getGameStartTime(): number {
			return this.serverState.gameStartTime
		}

	setServerTime(serverTime: number): void {
		this.serverState.serverTime = serverTime
	}
		getServerTime(): number {
			return this.serverState.serverTime
		}

	resetServerState(): void {
		this.serverState = {
			status       : GameStatus.LOBBY,
			gameStartTime: 0,
			outfits      : new Map<string, Outfit>(),
			players      : new Map<string, string>(),
			serverTime   : 0,
			votes        : new Map<string, string>(),
		}
	}

	setPlayers(players: Map<string, string>): void {
		this.serverState.players = players
		eventBus.emit(ClientEvents.PLAYERS_UPDATED, players)
	}
		getPlayers(): Map<string, string> {
			return this.serverState.players
		}



	// MARK: User data
	getUserId(): string {
		return this.clientState.userId
	}

	getDisplayName(): string {
		return this.clientState.displayName
	}



	// MARK: Player Set/Getters
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
	getPlayerOutfit(): Outfit {
		return {
			bodyShape: this.clientState.playerBodyShape,
			hairColor: this.clientState.playerHairColor,
			skinColor: this.clientState.playerSkinColor,
			wearables: this.clientState.playerWearables.map(w => w.urn),
		}
	}
	


	// MARK: NPC Set/Getters
	setNPCSkinColor(color: Color3): void {
		this.clientState.npcSkinColor = color
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
		ClientMessaging.RequestOutfitChange()
	}
		getNPCSkinColor(): Color3 {
			return this.clientState.npcSkinColor
		}

	setNPCHairColor(color: Color3): void {
		this.clientState.npcHairColor = color
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
		ClientMessaging.RequestOutfitChange()
	}
		getNPCHairColor(): Color3 {
			return this.clientState.npcHairColor
		}
	setNPCBodyShape(shape: string): void {
		this.clientState.npcBodyShape = shape
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
		ClientMessaging.RequestOutfitChange()
	}
		getNPCBodyShape(): string {
			return this.clientState.npcBodyShape
		}

	setNPCWearables(wearables: Wearable[]): void {
		this.clientState.npcWearables = wearables
		eventBus.emit(ClientEvents.OUTFIT_CHANGED, {})
		ClientMessaging.RequestOutfitChange()
	}
		getNPCWearables(): Wearable[] {
			return this.clientState.npcWearables
		}

	getNPCOutfit(): Outfit {
		return {
			bodyShape: this.clientState.npcBodyShape,
			hairColor: this.clientState.npcHairColor,
			skinColor: this.clientState.npcSkinColor,
			wearables: this.clientState.npcWearables.map(w => w.urn),
		}
	}
}
