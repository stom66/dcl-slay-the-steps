import { Color3 } from '@dcl/sdk/math'

import { GameStatus } from 'src/shared/enums'
import { ClientState, Outfit, NotifyStatePayload } from 'src/shared/types'
import { eventBus } from 'src/shared/utils/eventBus'
import { userProfileCache } from 'src/shared/utils/userProfileCache'

import { Wearable } from 'src/client/data/shopSlotData'
import { clockSync } from 'src/shared/utils/clockSync'
import { ClientEvents } from 'src/client/clientEvents'
import { ClientMessaging } from 'src/client/clientMessaging'


// MARK: ClientStore
export class ClientStore {
	private static instance: ClientStore | undefined

	private clientState: ClientState = {
		userId           : "",
		displayName      : "",
		enrolledInGame   : false,
		currentTurnUserId: "",

		playerBodyShape  : "",
		playerHairColor  : Color3.Red(),
		playerSkinColor  : Color3.Red(),
		playerWearables  : [] as Wearable[],

		npcBodyShape     : "",
		npcHairColor     : Color3.Green(),
		npcSkinColor     : Color3.Green(),
		npcWearables     : [] as Wearable[],

		gameStartTime    : 0,
		playersInGame    : new Map<string, string>(),
		serverStatus     : GameStatus.LOBBY,
		voteResults      : new Map<string, string>(),
	}
	
	private constructor() {
		console.log('ClientStore: constructor')
	}


	// MARK: Init
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
	setClientState(data: NotifyStatePayload): void {
		this.setGameStartTime(clockSync.toLocalTime(data.gameStartTime))
		this.setPlayers(new Map(data.players.map(p => [p.userId, p.displayName])))
		this.setServerStatus(data.status as GameStatus)
		this.setEnrolledInGame(data.players.some(p => p.userId === this.getUserId()))
		this.setVoteResults(new Map(data.voteResults.map((p) => [p.userId, p.voteFor])))
		this.setCurrentTurnUserId(undefined)
	}
		getClientState(): ClientState {
			return this.clientState
		}


	// MARK: User data
	getUserId(): string {
		return this.clientState.userId
	}
	getDisplayName(): string {
		return this.clientState.displayName
	}


	// MARK: Enrolled
	setEnrolledInGame(enrolled: boolean): void {
		this.clientState.enrolledInGame = enrolled
	}
		isEnrolledInGame(): boolean {
			return this.clientState.enrolledInGame
		}


	// MARK: Current Turn User ID
	setCurrentTurnUserId(userId: string | undefined): void {
		this.clientState.currentTurnUserId = userId
	}
		getCurrentTurnUserId(): string | undefined {
			return this.clientState.currentTurnUserId
		}


	// MARK: IsMyTurn
	isMyTurn(): boolean {
		return this.clientState.currentTurnUserId == this.clientState.userId
	}


	// MARK: Server Status
	setServerStatus(status: GameStatus): void {
		this.clientState.serverStatus = status
	}
		getServerStatus(): GameStatus {
			return this.clientState.serverStatus
		}


	// MARK: Game Start Time
	setGameStartTime(gameStartTime: number): void {
		this.clientState.gameStartTime = gameStartTime
	}
		getGameStartTime(): number {
			return this.clientState.gameStartTime
		}


	// MARK: Players
	setPlayers(players: Map<string, string>): void {
		this.clientState.playersInGame = players
		this.clientState.enrolledInGame = players.has(this.clientState.userId)
		eventBus.emit(ClientEvents.PLAYERS_UPDATED, players)
	}
		getPlayers(): Map<string, string> {
			return this.clientState.playersInGame
		}


	// MARK: Vote Results
	setVoteResults(voteResults: Map<string, string>): void {
		this.clientState.voteResults = voteResults
	}
		getVoteResults(): Map<string, string> {
			return this.clientState.voteResults
		}


	// MARK: Player Outfit Set/Getters
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
			userId   : this.clientState.userId,
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
			userId   : this.clientState.userId,
			bodyShape: this.clientState.npcBodyShape,
			hairColor: this.clientState.npcHairColor,
			skinColor: this.clientState.npcSkinColor,
			wearables: this.clientState.npcWearables.map(w => w.urn),
		}
	}
}
