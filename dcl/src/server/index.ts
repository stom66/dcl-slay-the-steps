import { MessageType, room } from "../shared/room"
import { serverHandler } from "./serverHandler"
import { _gameManager } from "./gameManager"
import { sendServerTime } from "./serverMessaging"
import { GameSettings } from "src/shared/settings"
import * as utils from "@dcl-sdk/utils"

export async function initServer(): Promise<void> {
	console.log("Server: initServer()")
	
	serverHandler.init()
	_gameManager.init()

	sendServerTime()

	utils.timers.setInterval(() => {
		console.log('Server: sending server time')
		sendServerTime()
	}, GameSettings.SERVER_TIME_UPDATE_INTERVAL)
	
}