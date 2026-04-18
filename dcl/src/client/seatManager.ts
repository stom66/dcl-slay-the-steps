import { engine, InputModifier, Transform } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { movePlayerTo } from "~system/RestrictedActions"

import { GameStatus } from "src/shared/enums"
import { GameSettings } from "src/shared/settings"
import { ClientState } from "src/shared/types"
import { eventBus } from "src/shared/utils/eventBus"

import { ClientEvents } from "src/client/clientEvents"
import { ClientStore } from "src/client/clientStore"
import { GetRandomPointInCircle } from "src/client/utils"


export namespace SeatManager {

	//MARK: Event bindings

	eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
		if (data.serverStatus == GameStatus.GAME_ENDED) {
			MovePlayerToLobby()
		}
	})

	eventBus.on(ClientEvents.JOIN_AS_SPECTATOR, (data) => {
		const spectatorIds = [...clientStore.getSpectators().keys()]
		const spectatorIndex = spectatorIds.indexOf(clientStore.getUserId())

		// Move them to a seat, but we go from the end of the seating array
		if (spectatorIndex >= 0 && spectatorIndex < seatPositions.length) {
			MovePlayerToSeat(seatPositions.length - spectatorIndex - 1)
		} else {
			console.error('SeatManager: JOIN_AS_SPECTATOR: spectator not found')
		}
	})


	// MARK: Vars
	const clientStore = ClientStore.getInstance()
	const seatPositions = [
		Vector3.create(10.261, 10.001, 17.115), // SeatinB.a 
		Vector3.create(21.734, 10.009, 17.115), // SeatinB.b 
		Vector3.create(10.261, 9.998, 5.659),   // SeatinB.c 
		Vector3.create(21.734, 10.001, 5.659),  // SeatinB.d 
		Vector3.create(7.99, 10.001, 14.844),   // SeatinB.e 
		Vector3.create(24.005, 10.001, 14.844), // SeatinB.f 
		Vector3.create(7.99, 9.998, 3.387),     // SeatinB.g 
		Vector3.create(24.005, 9.981, 3.387),   // SeatinB.h 
		Vector3.create(7.99, 9.998, 7.98),      // SeatinB.i 
		Vector3.create(24.005, 9.981, 7.98),    // SeatinB.j 
		Vector3.create(7.99, 10.001, 19.437),   // SeatinB.k 
		Vector3.create(24.005, 10.001, 19.437), // SeatinB.l 
		Vector3.create(5.719, 10.001, 5.659),   // SeatinB.m 
		Vector3.create(26.276, 9.981, 5.659),   // SeatinB.n 
		Vector3.create(5.719, 9.998, 17.115),   // SeatinB.o 
		Vector3.create(26.276, 10.001, 17.115) // SeatinB.p
	]

	// MARK: MovePlayerToSeat
	export function MovePlayerToSeat(
		seatIndex: number,
		dontLockInputs: boolean = false
	) {
		console.log("SeatManager: MovePlayerToSeat(): seatIndex", seatIndex.toString())
		
		// Move the player to that seat
		movePlayerTo({
			newRelativePosition: seatPositions[seatIndex], 
			cameraTarget       : GameSettings.ARENA_SPAWN_LOOK_AT_TARGET
		})

		// Also freeze their inputs
		if (!dontLockInputs) {
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
	}

	
	// MARK: MovePlayerToLobby
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
