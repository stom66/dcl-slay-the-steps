import { MessageType, room } from "../room"
import { serverHandler } from "./serverHandler"
import { _gameManager } from "./gameManager"

export async function initServer(): Promise<void> {
	console.log("Server: initServer()")
	
	serverHandler.init()
	_gameManager.init()
	
}