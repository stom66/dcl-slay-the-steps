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

	static COUNTDOWN_DURATION        = 6
	static ROUND_DURATION_PER_PLAYER = 6
	static VOTING_DURATION           = 10
	static GAME_ENDED_DURATION       = 10
	static UTC_UPDATE_INTERVAL       = 15

	static STAGE_SPAWN_POSITION = Vector3.create(16, 0, 16)
	static STAGE_SPAWN_ROTATION = Quaternion.fromEulerDegrees(0, 0, 0)
	static STAGE_SPAWN_SCALE = Vector3.create(1, 1, 1)
}
