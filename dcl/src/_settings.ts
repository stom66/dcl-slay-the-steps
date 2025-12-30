import { Quaternion, Vector3 } from '@dcl/sdk/math'

declare var process: {
	env: {
		NODE_ENV: string
	}
}
const env = process.env.NODE_ENV
const IS_DEBUG = env == "development"



// ███████╗███████╗████████╗████████╗██╗███╗   ██╗ ██████╗ ███████╗
// ██╔════╝██╔════╝╚══██╔══╝╚══██╔══╝██║████╗  ██║██╔════╝ ██╔════╝
// ███████╗█████╗     ██║      ██║   ██║██╔██╗ ██║██║  ███╗███████╗
// ╚════██║██╔══╝     ██║      ██║   ██║██║╚██╗██║██║   ██║╚════██║
// ███████║███████╗   ██║      ██║   ██║██║ ╚████║╚██████╔╝███████║
// ╚══════╝╚══════╝   ╚═╝      ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝
//

export class SceneSettings {
	static SCENE_TRANSFORM = {
		position: Vector3.create(0, 0, 0),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale:    Vector3.create(1, 1, 1)
	}

	static SCENE_TRANSFORM_180 = {
		position: Vector3.create(0, 0, 0),
		rotation: Quaternion.fromEulerDegrees(0, 180, 0),
		scale:    Vector3.create(1, 1, 1)
	}
}

export class GameSettings {
	static URL_TIME_API               = 'https://timeapi.io/api/Time/current/zone?timeZone=UTC'
	static URL_WEARABLE_DATA_API      = "https://marketplace-api.decentraland.org/v1/items"

	static COUNTDOWN_DURATION         = IS_DEBUG ? 8 : 60
	static ROUND_DURATION_PER_PLAYER  = IS_DEBUG ? 18 : 20
	static ROUND_START_DELAY          = IS_DEBUG ? 4 : 4 // Delay before the round starts
	static ROUND_INTERVAL             = IS_DEBUG ? 2 : 2 // Interval between players, MUST be longer than the ROUND_START_DELAY
	static VOTING_DURATION            = 10
	static GAME_ENDED_DURATION        = 5
	static UTC_UPDATE_INTERVAL        = IS_DEBUG ? 30 : 300 // Set to five minutes now we're not using the external API any more
	static YOU_ARE_NEXT_PREEMPT_TIME  = IS_DEBUG ? 3 : 3 // How far in advance of the players turn shoud we show the message letting them know they are next

	static NPC_SPAWN_SCALE            = Vector3.create(1, 1, 1)
	static NPC_SPAWN_ROTATION         = Quaternion.fromEulerDegrees(0, 180, 0)

	static NPC_SPAWN_POSITION         = Vector3.create(16, 16.241, 31.25)
	static NPC_PATH_STAIRS_WAIT       = Vector3.create(16, 16.241, 29)
	static NPC_PATH_STAIRS_TOP        = Vector3.create(16, 16.241, 28.511)
	static NPC_PATH_STAIRS_BOTTOM     = Vector3.create(16, 10.53, 22.73)
	static NPC_PATH_CATWALK_MIDPOINT  = Vector3.create(16, 10.53, 17.5)
	static NPC_PATH_CATWALK_JUNCTION  = Vector3.create(16, 10.53, 12.07)
	static NPC_PATH_EXIT_LEFT         = Vector3.create(3.76,  10.53, 12.07)
	static NPC_PATH_EXIT_RIGHT        = Vector3.create(28.24, 10.53, 12.07)

	static LOBBY_SPAWN_POSITION       = Vector3.create(16, 0, 20)
	static LOBBY_SPAWN_LOOK_AT_TARGET = Vector3.create(16, 13.5, 26)
	// No ARENA spawn position, chooses a random seat
	static ARENA_SPAWN_LOOK_AT_TARGET = Vector3.create(16, 13.5, 26)

	static MAX_PLAYERS = 16
}

export class MessageBusEvents {
	static REQUEST_JOIN_GAME    = 'joinGameRequest' // Used by the clients, to request to join a game
	static REQUEST_STATE        = 'stateRequest'    // Used by the clients, to request the current game state
	static NOTIFY_CLIENT_STATE  = 'stateUpdate'     // Used by the server, to notify the clients of a game state update
	static NOTIFY_SERVER_OUTFIT = 'outfitUpdate'    // Used by the clients, to notify the server of an outfit update
	static NOTIFY_SERVER_VOTE   = 'requestVote'     // Used by the clients, to notify the server of a vote
}
