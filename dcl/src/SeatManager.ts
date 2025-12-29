import { Vector3 } from "@dcl/sdk/math"
import { movePlayerTo } from "~system/RestrictedActions"

import { GameSettings } from "./_settings"
import { GetRandomPointInCircle } from "./utils"
import { _CameraController } from "./CameraController"
import { engine, InputModifier, Transform } from "@dcl/sdk/ecs"

const LOOK_AT_TARGET = Vector3.create(16, 13.5, 26)

class SeatManager {

	seatPositions = [
		Vector3.create(23.71,  10, 3.787),
		Vector3.create(6.169,  10, 18.313),
		Vector3.create(21.589, 10, 5.909),
		Vector3.create(8.29,   10, 3.787),
		Vector3.create(23.71,  10, 20.434),
		Vector3.create(8.29,   10, 8.03),
		Vector3.create(23.71,  10, 16.192),
		Vector3.create(8.29,   10, 20.434),
		Vector3.create(10.411, 10, 18.313),
		Vector3.create(6.169,  10, 5.909),
		Vector3.create(21.589, 10, 18.313),
		Vector3.create(10.411, 10, 5.909),
		Vector3.create(25.831, 10, 18.313),
		Vector3.create(23.71,  10, 8.03),
		Vector3.create(25.831, 10, 5.909),
		Vector3.create(8.29,   10, 16.192),
	]

	constructor() {
		console.log("SeatManager constructor")
	}

	init() {
		console.log("SeatManager init")
	}

	MovePlayerToSeat(
		seatIndex: number
	) {
		// Move the player to that seat
		movePlayerTo({
			newRelativePosition: this.seatPositions[seatIndex], 
			cameraTarget: GameSettings.ARENA_SPAWN_LOOK_AT_TARGET
		})

		// Also freeze their inputs
		InputModifier.createOrReplace(engine.PlayerEntity, {
			mode: InputModifier.Mode.Standard({
				disableAll  : false,
				disableEmote: false,
				disableJog  : true,
				disableJump : true,
				disableRun  : true,
				disableWalk : true,
			}),
		})
	}

	
	MovePlayerToLobby() {
		_CameraController.ResetCamera()

		const randomPoint = GetRandomPointInCircle(Vector3.create(16, 0, 16), 6)
		console.log("SeatManager: MovePlayerToLobby: randomPoint", randomPoint.x, randomPoint.y, randomPoint.z)

		// const playerTransform = Transform.getMutable(engine.PlayerEntity) // despite what the docs say, this doesn't work. classic.
		// playerTransform.position = randomPoint
 		movePlayerTo({
			newRelativePosition:randomPoint,
			cameraTarget: GameSettings.LOBBY_SPAWN_LOOK_AT_TARGET
		})

		InputModifier.createOrReplace(engine.PlayerEntity, {
			mode: InputModifier.Mode.Standard({
				disableAll  : false,
				disableEmote: false,
				disableJog  : false,
				disableJump : false,
				disableRun  : false,
				disableWalk : false,
			}),
		})
	}

}

export const _SeatManager = new SeatManager()