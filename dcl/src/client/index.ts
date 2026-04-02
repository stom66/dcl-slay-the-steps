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
import { SetupPortal } from "./portal";

export async function initClient() {

	const store = ClientStore.getInstance()
	await store.init()

	ClientHandler.init()
	gameStateHandler.init()

	ShopManager.init()
	OutfitManager.init()
	MannequinManager.init()

	SetupPortal()
	
	SpawnGameHostNPC()
	SetupLights()
	SetupColorPickers()

	SetupUI()
}