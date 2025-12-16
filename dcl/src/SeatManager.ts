import { Vector3 } from "@dcl/sdk/math"
import { movePlayerTo } from "~system/RestrictedActions"
import { GameSettings } from "./_settings"
import { _CameraController } from "./CameraController"
import { GetRandomPointInCircle } from "./utils"

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
	}

	UnseatPlayer() {
		this.MovePlayerToLobby()
	}

	
	MovePlayerToLobby() {
		_CameraController.ResetCamera()

		const randomPoint = GetRandomPointInCircle(Vector3.create(16, 0, 16), 6)
		console.log("SeatManager: MovePlayerToLobby: randomPoint", randomPoint.x, randomPoint.y, randomPoint.z)

		movePlayerTo({
			newRelativePosition:randomPoint,
			cameraTarget: GameSettings.LOBBY_SPAWN_LOOK_AT_TARGET
		})
	}

}

export const _SeatManager = new SeatManager()