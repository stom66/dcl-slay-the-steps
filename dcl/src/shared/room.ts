import { registerMessages } from '@dcl/sdk/network'
import { Schemas } from '@dcl/sdk/ecs'

// MARK: MessageType enum
export enum MessageType {
	REQUEST_STATE             = 'requestState',           // Used by the clients, to request the current game state
	REQUEST_JOIN_GAME         = 'requestJoinGame',        // Used by the clients, to request to join a game
	REQUEST_SPECTATE_GAME     = 'requestSpectateGame',    // Used by the clients, to request to spectate a game
	REQUEST_OUTFIT_UPDATE     = 'requestOutfitUpdate',    // Used by the clients, to notify the server of an outfit update
	REQUEST_ADD_VOTE          = 'requestAddVote',         // Used by the clients, to notify the server of a vote
	REQUEST_REMOVE_VOTE       = 'requestRemoveVote',      // Used by the clients, to notify the server of a vote
	REQUEST_EMOTE             = 'requestEmote',           // Used by the clients, to notify the server of an emote

	NOTIFY_ABORT_GAME         = "notifyAbortGame",        // Sent by server, to notify the clients that the game has been aborted
	NOTIFY_STATE              = "notifyState",            // Sent by server, to notify the clients of the game state
	NOTIFY_TURN_STARTING      = "notifyTurnStarting",     // Sent by the server to notify all players that a turn is starting
	NOTIFY_TURN_STARTING_SOON = "notifyTurnStartingSoon", // Sent by the server to specific players to let them know their turn is about to start
	NOTIFY_PLAYER_LIST        = "notifyPlayerList",       // Sent by server, to notify the clients of the player list
	NOTIFY_SPECTATOR_JOINED   = "notifySpectatorJoined",   // Sent by server, to notify the clients that a spectator has joined
	NOTIFY_EMOTE              = "notifyEmote",            // Sent by server, to notify the clients of an emote
	NOTIFY_WARNING            = "notifyWarning",          // Sent by server, to notify the clients of a warning
	NOTIFY_SERVER_TIME        = "notifyServerTime",       // Sent by server, to notify the clients of the server time
}

// MARK: Message schemas
const Messages = {
	// Sent by client
	[MessageType.REQUEST_STATE]        : Schemas.Map({}),
	[MessageType.REQUEST_JOIN_GAME]    : Schemas.Map({
		displayName: Schemas.String,
		outfit     : Schemas.Map({
			userId   : Schemas.String,
			wearables: Schemas.Array(Schemas.String),
			bodyShape: Schemas.String,
			hairColor: Schemas.Color3,
			skinColor: Schemas.Color3,
		}),
	}),
	[MessageType.REQUEST_SPECTATE_GAME]    : Schemas.Map({
		displayName: Schemas.String,
	}),
	[MessageType.REQUEST_OUTFIT_UPDATE]: Schemas.Map({
		userId   : Schemas.String,
		wearables: Schemas.Array(Schemas.String),
		bodyShape: Schemas.String,
		hairColor: Schemas.Color3,
		skinColor: Schemas.Color3,
	}),
	[MessageType.REQUEST_ADD_VOTE]   : Schemas.String,
	[MessageType.REQUEST_REMOVE_VOTE]: Schemas.String,
	[MessageType.REQUEST_EMOTE]      : Schemas.String,


	// Sent by server
	[MessageType.NOTIFY_ABORT_GAME]: Schemas.Map({}),
	[MessageType.NOTIFY_STATE]: Schemas.Map({
		sentAt       : Schemas.Int64,
		gameStartTime: Schemas.Int64,
		players      : Schemas.Array(Schemas.Map({
			userId      : Schemas.String,
			displayName : Schemas.String,
		})),
		spectators   : Schemas.Array(Schemas.Map({
			userId      : Schemas.String,
			displayName : Schemas.String,
		})),
		status       : Schemas.String,
		voteResults  : Schemas.Array(Schemas.Map({
			userId: Schemas.String,
			voteFor: Schemas.String
		}))
	}),

	[MessageType.NOTIFY_TURN_STARTING_SOON]: Schemas.Map({}),

	[MessageType.NOTIFY_TURN_STARTING]: Schemas.Map({
		sentAt     : Schemas.Int64,
		outfit     : Schemas.Map({
			userId    : Schemas.String,
			wearables : Schemas.Array(Schemas.String),
			bodyShape : Schemas.String,
			hairColor : Schemas.Color3,
			skinColor : Schemas.Color3,
		}),
		userId     : Schemas.String,
		displayName: Schemas.String,
	}),
	[MessageType.NOTIFY_PLAYER_LIST]: Schemas.Map({
		sentAt: Schemas.Int64,
		players: Schemas.Array(
			Schemas.Map({
				userId: Schemas.String,
				displayName: Schemas.String,
			})
		),
	}),
	[MessageType.NOTIFY_SPECTATOR_JOINED]: Schemas.Map({
		sentAt: Schemas.Int64,
		players: Schemas.Array(
			Schemas.Map({
				userId: Schemas.String,
				displayName: Schemas.String,
			})
		),
	}),
	[MessageType.NOTIFY_EMOTE]: Schemas.Map({
		sentAt: Schemas.Int64,
		userId: Schemas.String,
		emote: Schemas.String,
	}),
	[MessageType.NOTIFY_WARNING]: Schemas.String,
	[MessageType.NOTIFY_SERVER_TIME]: Schemas.Int64,
}

// Export room
export const room = registerMessages(Messages)
