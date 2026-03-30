import { getPlayer } from "@dcl/sdk/players";
import { ClientHandler } from "./clientHandler";
import { ClientStore } from "./clientStore";
import { SetupColorPickers } from "./colorPickers";
import { gameStateHandler } from "./gameStateHandler";
import { ShopManager } from "./shopManager";
import { SetupUI } from "./ui";
import { OutfitManager } from "./outfitManager";
import { SpawnGameHostNPC } from "./npcGameHost";

export function initClient(): void {
	
	SetupColorPickers()
	SetupUI()

	const store = ClientStore.getInstance()
	void store.init().then(() => {
		console.log('initClient: userId:', store.getUserId())

		ClientHandler.init()
		gameStateHandler.init()

		ShopManager.init()
		OutfitManager.init()
		SpawnGameHostNPC()
	}).catch((err) => {
		console.error('initClient: bootstrap failed', err)
	})
}