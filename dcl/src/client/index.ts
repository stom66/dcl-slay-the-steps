import { ClientStore } from "./clientStore";

import { ClientHandler } from "./clientHandler";
import { SetupColorPickers } from "./colorPickers";
import { gameStateHandler } from "./gameStateHandler";
import { ShopManager } from "./shopManager";
import { SetupUI } from "./ui";
import { OutfitManager } from "./outfitManager";
import { SpawnGameHostNPC } from "./npcGameHost";
import { SetupLights } from "./lights";
import { MannequinManager } from "./mannequinManager";

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
		MannequinManager.init()
		
		SpawnGameHostNPC()
		SetupLights()
	}).catch((err) => {
		console.error('initClient: bootstrap failed', err)
	})
}