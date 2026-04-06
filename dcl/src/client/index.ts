import { ClientStore } from "src/client/clientStore";
import { ClientHandler } from "src/client/clientHandler";
import { gameStateHandler } from "src/client/gameStateHandler";

import { CameraController } from "src/client/cameraController";
import { MannequinManager } from "src/client/mannequinManager";
import { OutfitManager } from "src/client/outfitManager";
import { ShopManager } from "src/client/shopManager";
import { SoundManager } from "src/client/soundManager";
import { StageController } from "src/client/stageController";

import { SetupColorPickers } from "src/client/colorPickers";
import { SetupGameHostNPC } from "src/client/npcGameHost";
import { SetupLights } from "src/client/lights";
import { SetupPortal } from "src/client/portal";
import { SetupUI } from "src/client/ui";


export async function initClient() {

	const store = ClientStore.getInstance()
	await store.init()
	ClientHandler.init()
	gameStateHandler.init()

	CameraController.init()
	OutfitManager.init() // needs to come before MannequinManager
	SoundManager.init()
	StageController.init()
	
	ShopManager.init()

	SetupColorPickers()
	SetupGameHostNPC()
	SetupLights()
	SetupPortal()
	SetupUI()
	
	MannequinManager.init() // needs to come after OutfitManager
}