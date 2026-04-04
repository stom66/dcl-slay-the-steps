import * as utils from "@dcl-sdk/utils"

import { GameSettings } from "src/shared/settings"
import { serverHandler } from "./serverHandler"
import { gameManager } from "./gameManager"
import { sendServerTime, sendStateUpdate } from "./serverMessaging"
import { ServerStore } from "./serverStore"
import { onEnterScene } from "@dcl/sdk/players"

export async function initServer(): Promise<void> {
	console.log("Server: initServer()")

	const store = ServerStore.getInstance()
	
	serverHandler.init()
	gameManager.init()

	// When a player joins the game, send the state update to the player
	onEnterScene((player) => {
		sendStateUpdate([player.userId])
	})

	// Periodically send the server time to the clients
	sendServerTime()
	utils.timers.setInterval(() => {
		sendServerTime()
	}, GameSettings.SERVER_TIME_UPDATE_INTERVAL)
}