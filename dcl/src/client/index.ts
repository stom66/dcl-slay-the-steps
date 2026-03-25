import { getPlayer } from "@dcl/sdk/players";
import { ClientHandler } from "./clientHandler";
import { ClientStore } from "./clientStore";
import { SetupColorPickers } from "./colorPickers";
import { gameStateHandler } from "./gameStateHandler";
import { ShopManager } from "./shopManager";
import { SetupUI } from "./ui";

export function initClient(): void {
	
	SetupColorPickers()
	SetupUI()


	let myPlayer = getPlayer()

	if (myPlayer) {
		console.log('Is Guest: ', myPlayer.isGuest)
		console.log('Name : ', myPlayer.name)
		console.log('UserId : ', myPlayer.userId)
		console.log('Avatar shape : ', myPlayer.position)
		console.log('Avatar shape : ', myPlayer.avatar?.bodyShapeUrn)
		console.log('Avatar eyes color : ', myPlayer.avatar?.eyesColor)
		console.log('Avatar hair color : ', myPlayer.avatar?.hairColor)
		console.log('Wearables on : ', myPlayer.wearables)
		console.log('Emotes available : ', myPlayer.emotes)
	}

	const store = ClientStore.getInstance()
	void store.init().then(() => {
		console.log('initClient: userId:', store.getUserId())

		ClientHandler.init()
		gameStateHandler.init()

		ShopManager.init()
	}).catch((err) => {
		console.error('initClient: bootstrap failed', err)
	})
}