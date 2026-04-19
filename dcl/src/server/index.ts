import { onEnterScene, onLeaveScene } from "@dcl/sdk/players"
import * as utils from "@dcl-sdk/utils"

import { GameSettings } from "src/shared/settings"

import { gameManager } from "src/server/gameManager"
import { serverHandler } from "src/server/serverHandler"
import { sendServerTime, sendStateUpdate } from "src/server/serverMessaging"
import { ServerStore } from "src/server/serverStore"
import { Metrics } from "src/server/metrics/client"


export async function initServer(): Promise<void> {
	console.log("Server: initServer()")

	const serverStore = ServerStore.getInstance() // Initialize the store

	Metrics.init()

	serverHandler.init()
	gameManager.init()

	// Periodically send the server time to the clients
	sendServerTime()
	utils.timers.setInterval(() => {
		sendServerTime()
	}, GameSettings.SERVER_TIME_UPDATE_INTERVAL)


	// MARK: Event bindings
	onEnterScene((player) => {
		sendStateUpdate([player.userId])
		Metrics.startSession(player.userId, player.name)
	})
	onLeaveScene((userId) => {
		Metrics.endSession(userId)
		serverStore.removePlayer(userId)
	})
}
 