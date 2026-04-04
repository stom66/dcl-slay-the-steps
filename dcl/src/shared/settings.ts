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
}

export class GameSettings {
	static URL_WEARABLE_DATA_API      = "https://marketplace-api.decentraland.org/v1/items"

	static SERVER_TIME_UPDATE_INTERVAL   = (IS_DEBUG ? 15 : 30) * 1000

	static COUNTDOWN_DURATION            = (IS_DEBUG ? 8 : 60) * 1000
	static ROUND_DURATION_PER_PLAYER     = 25 * 1000
	static ROUND_START_DELAY             = (IS_DEBUG ? 5 : 6) * 1000   // Delay before the round starts
	static ROUND_INTERVAL                = (IS_DEBUG ? 2 : 2) * 1000   // Interval between players, MUST be longer than the ROUND_START_DELAY
	static VOTING_DURATION               = 10 * 1000
	static GAME_ENDED_DURATION           = 4 * 1000
	static YOU_ARE_NEXT_PREEMPT_TIME     = (IS_DEBUG ? 3 : 4) * 1000   // How far in advance of the players turn shoud we show the message letting them know they are next


	static LOBBY_SPAWN_POSITION       = Vector3.create(16, 0, 20)
	static LOBBY_SPAWN_LOOK_AT_TARGET = Vector3.create(16, 13.5, 26)
	// No ARENA spawn position, chooses a random seat
	static ARENA_SPAWN_LOOK_AT_TARGET = Vector3.create(16, 13.5, 26)

	static MAX_PLAYERS = 16
}