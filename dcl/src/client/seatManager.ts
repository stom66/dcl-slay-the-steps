import { engine, InputModifier, Transform } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { movePlayerTo } from "~system/RestrictedActions"

import { GameSettings } from "src/shared/settings"
import { GetRandomPointInCircle } from "src/client/utils"
import { CameraController } from "src/client/cameraController"
import { ClientStore } from "./clientStore"
import { ClientEvents } from "./clientEvents"
import { eventBus } from "src/shared/utils/eventBus"
import { ClientState, NotifyStatePayload } from "src/shared/types"
import { GameStatus } from "src/shared/enums"


export namespace SeatManager {

	const seatPositions = [
		Vector3.create(5.719,  10, 5.659),
		Vector3.create(7.99,   10, 7.98),
		Vector3.create(10.261, 10, 5.659),
		Vector3.create(7.99,   10, 3.387),
		Vector3.create(5.719,  10, 17.115),
		Vector3.create(7.99,   10, 19.437),
		Vector3.create(10.261, 10, 17.115),
		Vector3.create(7.99,   10, 14.844),
		Vector3.create(21.734, 10, 5.659),
		Vector3.create(24.005, 10, 7.98),
		Vector3.create(26.276, 10, 5.659),
		Vector3.create(24.005, 10, 3.387),
		Vector3.create(21.734, 10, 17.115),
		Vector3.create(24.005, 10, 19.437),
		Vector3.create(26.276, 10, 17.115),
		Vector3.create(24.005, 10, 14.844),
	]

	const clientStore = ClientStore.getInstance()

	eventBus.on(ClientEvents.NOTIFY_ABORT_GAME, (data) => {
		if (clientStore.isEnrolledInGame()) {
			MovePlayerToLobby()
		}
	})

	eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
		if (data.serverStatus == GameStatus.LOBBY) {
			MovePlayerToLobby()
		}
	})

	//MovePlayerToLobby()


	export function MovePlayerToSeat(
		seatIndex: number
	) {
		console.log("SeatManager: MovePlayerToSeat(): seatIndex", seatIndex.toString())
		
		// Move the player to that seat
		movePlayerTo({
			newRelativePosition: seatPositions[seatIndex], 
			cameraTarget       : GameSettings.ARENA_SPAWN_LOOK_AT_TARGET
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

	
	export function MovePlayerToLobby() {
		if (!engine.PlayerEntity) return
		const playerTransform = Transform.get(engine.PlayerEntity)
		if (playerTransform.position.y < 5) {
			return // Player is already in the lobby
		}

		const randomPoint = GetRandomPointInCircle(Vector3.create(16, 0, 16), 6)
		console.log("SeatManager: MovePlayerToLobby(): randomPoint", randomPoint.x, randomPoint.y, randomPoint.z)

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