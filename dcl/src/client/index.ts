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
import { SpawnBirds } from "src/client/birds";
import { NPCWinner } from "./npcWinner";
import { Tutorial } from "./tutorial";
import { engine, Transform } from "@dcl/sdk/ecs";
import { onEnterScene } from "@dcl/sdk/players";
//import * as utils from "@dcl-sdk/utils"


export async function initClient() {
	// Tutorial launch
	var hasEnteredScene = false
	var tutorialHasRun = false

	onEnterScene(() => {
		hasEnteredScene = true
	})

	function waitForLoad() {
		if (tutorialHasRun) return

		if (!hasEnteredScene)  {console.log("waitForLoad: onEnterScene"); return}
		if (!Transform.getOrNull(engine.PlayerEntity)) {console.log("waitForLoad: PlayerEntity"); return}
		if (!Transform.getOrNull(engine.CameraEntity)) {console.log("waitForLoad: CameraEntity"); return}
		if (!MannequinManager.avatarHasLoaded) {console.log("waitForLoad: avatarHasLoaded"); return}

		tutorialHasRun = true
		engine.removeSystem(waitForLoad)

		Tutorial.TriggerTutorial()
	}


	// Init systems
	const store = ClientStore.getInstance()
	await store.init()
	ClientHandler.init()
	gameStateHandler.init()

	CameraController.init()
	NPCWinner.Init()
	OutfitManager.init() // needs to come before MannequinManager
	SoundManager.init()
	StageController.init()
	
	ShopManager.init()

	SetupColorPickers()
	//SetupGameHostNPC()
	SetupLights()
	SetupPortal()
	SetupUI()
	SpawnBirds()
	
	MannequinManager.init() // needs to come after OutfitManager

	// Wait for load, to trigger Tutorial
	engine.addSystem(waitForLoad)
}
