import { Quaternion, Vector3 } from '@dcl/sdk/math'


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
	static TIME_API_URL = 'https://timeapi.io/api/Time/current/zone?timeZone=UTC'

	static COUNTDOWN_DURATION         = 6
	static ROUND_DURATION_PER_PLAYER  = 16
	static ROUND_START_DELAY          = 3 // Delay before the round starts
	static VOTING_DURATION            = 10
	static GAME_ENDED_DURATION        = 10
	static UTC_UPDATE_INTERVAL        = 15

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
