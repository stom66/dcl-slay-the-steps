import { registerMessages } from '@dcl/sdk/network'
import { Schemas } from '@dcl/sdk/ecs'
import { GameStatus } from './utils/enums'

// Message type enum
export enum MessageType {
	REQUEST_STATE         = 'requestState',        // Used by the clients, to request the current game state
	REQUEST_JOIN_GAME     = 'requestJoinGame',     // Used by the clients, to request to join a game
	REQUEST_OUTFIT_UPDATE = 'requestOutfitUpdate', // Used by the clients, to notify the server of an outfit update
	REQUEST_ADD_VOTE      = 'requestAddVote',      // Used by the clients, to notify the server of a vote
	REQUEST_REMOVE_VOTE   = 'requestRemoveVote',   // Used by the clients, to notify the server of a vote
	REQUEST_EMOTE         = 'requestEmote',        // Used by the clients, to notify the server of an emote

	NOTIFY_STATE          = 'notifyState',         // Sent by server, to notify the clients of a game state update
	NOTIFY_PLAYER_LIST    = 'notifyPlayers',       // Sent by server, to notify the clients of the current players in the game
	NOTIFY_VOTE_RESULTS   = 'notifyVoteResults',   // Sent by server, to notify the clients of the vote results
	NOTIFY_EMOTE          = 'notifyEmote',         // Sent by server, to notify the clients of an emote
	NOTIFY_WARNING        = 'notifyWarning',       // Sent by server, to notify the clients of a warning
}

// Message schemas
const Messages = {
	// Sent by client
	[MessageType.REQUEST_STATE]        : Schemas.Map({}),
	[MessageType.REQUEST_JOIN_GAME]    : Schemas.Map({
		displayName: Schemas.String,
		userId     : Schemas.String,
		outfit     : Schemas.Map({
			wearables: Schemas.Array(Schemas.String),
			bodyShape: Schemas.String,
			hairColor: Schemas.String,
			skinColor: Schemas.String,
		}),
	}),
	[MessageType.REQUEST_OUTFIT_UPDATE]: Schemas.Map({
		wearables: Schemas.Array(Schemas.String),
		bodyShape: Schemas.String,
		hairColor: Schemas.String,
		skinColor: Schemas.String,
	}),
	[MessageType.REQUEST_ADD_VOTE]   : Schemas.String,
	[MessageType.REQUEST_REMOVE_VOTE]: Schemas.String,
	[MessageType.REQUEST_EMOTE]      : Schemas.String,


	// Sent by server
	[MessageType.NOTIFY_STATE]         : Schemas.Map({
		status: Schemas.String,
		gameStartTime: Schemas.Number,
		outfits: Schemas.Array(Schemas.Map({
			wearables: Schemas.Array(Schemas.String),
			bodyShape: Schemas.String,
			hairColor: Schemas.String,
			skinColor: Schemas.String,
		})),
		players: Schemas.Array(Schemas.Map({
			userId: Schemas.String,
			displayName: Schemas.String,
		}))
	}),

	[MessageType.NOTIFY_PLAYER_LIST]   : Schemas.Map({
		players: Schemas.Array(
			Schemas.Map({
				userId: Schemas.String,
				displayName: Schemas.String,
			})
		),
	}),
	[MessageType.NOTIFY_VOTE_RESULTS]  : Schemas.Map({
		voteResults: Schemas.Array(
			Schemas.Array(Schemas.String)
		)
	}),
	[MessageType.NOTIFY_EMOTE]: Schemas.Map({
		userId: Schemas.String,
		emote: Schemas.String,
	}),
	[MessageType.NOTIFY_WARNING]: Schemas.String,
}

// Register messages and export room
export const room = registerMessages(Messages)
