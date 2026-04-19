import { Quaternion, Vector3 } from '@dcl/sdk/math'


// MARK: Vars
declare var process: {
	env: {
		NODE_ENV: string
	}
}
const env = process.env.NODE_ENV
const IS_DEBUG = env == "development"


// MARK: SceneSettings
export class SceneSettings {

	static SCENE_TRANSFORM = {
		position: Vector3.create(0, 0, 0),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale:    Vector3.create(1, 1, 1)
	}
}


// MARK: GameSettings
export class GameSettings {
	static URL_WEARABLE_DATA_API       = "https://marketplace-api.decentraland.org/v1/items"

	static SERVER_TIME_UPDATE_INTERVAL = (IS_DEBUG ? 15: 30) * 1000

	static COUNTDOWN_DURATION          = (IS_DEBUG ? 8 : 60) * 1000
	static GAME_START_DELAY            = (IS_DEBUG ? 5 : 6) * 1000 // Delay before the round starts
	static ROUND_DURATION_PER_PLAYER   = (IS_DEBUG ? 30: 30) * 1000
	static ROUND_INTERVAL              = (IS_DEBUG ? 2 : 2) * 1000 // Interval between players, MUST be longer than the ROUND_START_DELAY
	static VOTING_DURATION             = 10 * 1000
	static GAME_ENDED_DURATION         = 4 * 1000
	static YOU_ARE_NEXT_PREEMPT_TIME   = (IS_DEBUG ? 3 : 4) * 1000 // Should be longer than the GAME_START_DELAY


	static LOBBY_SPAWN_POSITION        = Vector3.create(16, 0, 20)
	static LOBBY_SPAWN_LOOK_AT_TARGET  = Vector3.create(16, 13.5, 26)
	static ARENA_SPAWN_LOOK_AT_TARGET  = Vector3.create(16, 13.5, 26)

	static MAX_PLAYERS                 = 16

	static CAN_SPECTATORS_VOTE         = true
	static SHOW_RESULTS_TO_UNINVOLVED  = false

	static STORE_MAX_PAGES             = 80

	static LOADING_SCREEN_DELAY        = 2000
}
