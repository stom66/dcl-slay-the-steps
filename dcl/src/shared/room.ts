import { registerMessages } from '@dcl/sdk/network'
import { Schemas } from '@dcl/sdk/ecs'
import { GameStatus } from './enums'

// Message type enum
export enum MessageType {
	REQUEST_STATE             = 'requestState',           // Used by the clients, to request the current game state
	REQUEST_JOIN_GAME         = 'requestJoinGame',        // Used by the clients, to request to join a game
	REQUEST_OUTFIT_UPDATE     = 'requestOutfitUpdate',    // Used by the clients, to notify the server of an outfit update
	REQUEST_ADD_VOTE          = 'requestAddVote',         // Used by the clients, to notify the server of a vote
	REQUEST_REMOVE_VOTE       = 'requestRemoveVote',      // Used by the clients, to notify the server of a vote
	REQUEST_EMOTE             = 'requestEmote',           // Used by the clients, to notify the server of an emote

	NOTIFY_STATE              = "notifyState",             // Sent by server, to notify the clients of the game state
	NOTIFY_STATE_LOBBY        = "notifyStateLobby",       // Sent by server, to notify the clients of the lobby state
	NOTIFY_STATE_STARTING     = "notifyStateStarting",    // Sent by server, to notify the clients of the starting state
	NOTIFY_STATE_ROUND_START  = "notifyStateRoundStart",  // Sent by server, to notify the clients of the round start state
	NOTIFY_STATE_VOTE_START   = "notifyStateVoteStart",   // Sent by server, to notify the clients of the vote start state	
	NOTIFY_STATE_VOTE_RESULTS = "notifyStateVoteResults", // Sent by server, to notify the clients of the vote results
	NOTIFY_PLAYER_LIST        = "notifyPlayerList",       // Sent by server, to notify the clients of the player list
	NOTIFY_EMOTE              = "notifyEmote",            // Sent by server, to notify the clients of an emote
	NOTIFY_WARNING            = "notifyWarning",          // Sent by server, to notify the clients of a warning
	NOTIFY_SERVER_TIME        = "notifyServerTime",       // Sent by server, to notify the clients of the server time
}

// Message schemas
const Messages = {
	// Sent by client
	[MessageType.REQUEST_STATE]        : Schemas.Map({}),
	[MessageType.REQUEST_JOIN_GAME]    : Schemas.Map({
		displayName: Schemas.String,
		outfit     : Schemas.Map({
			wearables: Schemas.Array(Schemas.String),
			bodyShape: Schemas.String,
			hairColor: Schemas.Color3,
			skinColor: Schemas.Color3,
		}),
	}),
	[MessageType.REQUEST_OUTFIT_UPDATE]: Schemas.Map({
		wearables: Schemas.Array(Schemas.String),
		bodyShape: Schemas.String,
		hairColor: Schemas.Color3,
		skinColor: Schemas.Color3,
	}),
	[MessageType.REQUEST_ADD_VOTE]   : Schemas.String,
	[MessageType.REQUEST_REMOVE_VOTE]: Schemas.String,
	[MessageType.REQUEST_EMOTE]      : Schemas.String,


	// Sent by server
	[MessageType.NOTIFY_STATE]: Schemas.Map({
		status: Schemas.String,
		gameStartTime: Schemas.Number,
		outfits: Schemas.Array(Schemas.Map({
			userId: Schemas.String,
			wearables: Schemas.Array(Schemas.String),
			bodyShape: Schemas.String,
			hairColor: Schemas.Color3,
			skinColor: Schemas.Color3,
		})),
		players: Schemas.Array(Schemas.Map({
			userId: Schemas.String,
			displayName: Schemas.String,
		})),
		votes: Schemas.Array(Schemas.Map({
			userId: Schemas.String,
			vote: Schemas.String,
		})),
	}),
	[MessageType.NOTIFY_STATE_LOBBY]: Schemas.Map({}),
	[MessageType.NOTIFY_STATE_STARTING]: Schemas.Map({
		gameStartTime: Schemas.Number,
		serverTime: Schemas.Number,
	}),
	
	[MessageType.NOTIFY_STATE_ROUND_START]: Schemas.Map({
		userId: Schemas.String,
		displayName: Schemas.String,
		outfit: Schemas.Map({
			wearables: Schemas.Array(Schemas.String),
			bodyShape: Schemas.String,
			hairColor: Schemas.Color3,
			skinColor: Schemas.Color3,
		}),
	}),
	
	[MessageType.NOTIFY_STATE_VOTE_START]: Schemas.Map({
		players: Schemas.Array(Schemas.Map({
			userId: Schemas.String,
			displayName: Schemas.String,
		})),
	}),
	[MessageType.NOTIFY_STATE_VOTE_RESULTS]: Schemas.Map({
		voteResults: Schemas.Array(
			Schemas.Array(Schemas.String)
		)
	}),

	[MessageType.NOTIFY_PLAYER_LIST]: Schemas.Map({
		players: Schemas.Array(
			Schemas.Map({
				userId: Schemas.String,
				displayName: Schemas.String,
			})
		),
	}),
	[MessageType.NOTIFY_EMOTE]: Schemas.Map({
		userId: Schemas.String,
		emote: Schemas.String,
	}),
	[MessageType.NOTIFY_WARNING]: Schemas.String,
	[MessageType.NOTIFY_SERVER_TIME]: Schemas.Int64,
}

// Register messages and export room
export const room = registerMessages(Messages)
