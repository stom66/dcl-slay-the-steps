import { MessageType, room } from 'src/shared/room'
import { Outfit } from 'src/shared/types'

import { ClientStore } from 'src/client/clientStore'
import { GameSettings } from 'src/shared/settings'


export namespace ClientMessaging {

	// MARK: Request Outfit Change
	export function RequestOutfitChange() {
		const clientStore = ClientStore.getInstance()

		// Ignore if we're not enrolled in the game
		if (!clientStore.isEnrolledInGame()) return

		// Let the server know about the new outfit
		const outfit: Outfit = {
			userId   : clientStore.getUserId(),
			wearables: clientStore.getNPCWearables().map(w => w.urn),
			bodyShape: clientStore.getNPCBodyShape(),
			hairColor: clientStore.getNPCHairColor(),
			skinColor: clientStore.getNPCSkinColor(),
		}
		room.send(MessageType.REQUEST_OUTFIT_UPDATE, outfit)
	}


	// MARK: Request Join Game
	export function RequestJoinGame() {
		const clientStore = ClientStore.getInstance()

		// Let the server know about the new outfit
		room.send(MessageType.REQUEST_JOIN_GAME, {
			displayName: clientStore.getDisplayName(),
			outfit     : clientStore.getNPCOutfit(),
		})
	}
	export function RequestJoinGameAsSpectator() {
		const clientStore = ClientStore.getInstance()

		// Let the server know about the new outfit
		room.send(MessageType.REQUEST_SPECTATE_GAME, {
			displayName: clientStore.getDisplayName()
		})
	}


	// MARK: Request Emote
	export function RequestEmote(emote: string) {
		const clientStore = ClientStore.getInstance()

		// Ignore if we're not enrolled in the game
		if (!clientStore.isEnrolledInGame()) return

		// Let the server know about the new emote
		room.send(MessageType.REQUEST_EMOTE, emote)
	}


	// MARK: Request Add Vote
	export function RequestAddVote(userId: string) {
		const clientStore = ClientStore.getInstance()

		// Check we have the right to vote
		const canVote = 
			clientStore.isEnrolledInGame() ||
			GameSettings.CAN_SPECTATORS_VOTE && clientStore.isSpectatorInGame()
		if (!canVote) return

		// Let the server know about the new vote
		room.send(MessageType.REQUEST_ADD_VOTE, userId)
	}


	// MARK: Request Remove Vote
	export function RequestRemoveVote(userId: string) {
		const clientStore = ClientStore.getInstance()

		// Ignore if we're not enrolled in the game
		if (!clientStore.isEnrolledInGame()) return

		room.send(MessageType.REQUEST_REMOVE_VOTE, userId)
	}
}
