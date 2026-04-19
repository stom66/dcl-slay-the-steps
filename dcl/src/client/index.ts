import { engine, Transform } from "@dcl/sdk/ecs";
import { getPlayer, onEnterScene } from "@dcl/sdk/players";
import * as utils from "@dcl-sdk/utils"

import { ClientStore } from "src/client/clientStore";
import { ClientHandler } from "src/client/clientHandler";
import { gameStateHandler } from "src/client/gameStateHandler";

import { CameraController } from "src/client/cameraController";
import { MannequinManager } from "src/client/mannequinManager";
import { OutfitManager } from "src/client/outfitManager";
import { ShopManager } from "src/client/shopManager";
import { SoundManager } from "src/client/soundManager";
import { StageController } from "src/client/stageController";

import { SpawnBirds } from "src/client/birds";
import { SetupColorPickers } from "src/client/colorPickers";
import { SetupLights } from "src/client/lights";
import { SetupPortal } from "src/client/portal";
import { NPCWinner } from "src/client/npcWinner";
import { Tutorial } from "src/client/tutorial";
import { FreezePlayer } from "src/client/utils";

import { SetupUI } from "src/client/ui";
import { HideLoading } from "src/client/ui/ui.loading";

import { GameSettings } from "src/shared/settings";


export async function initClient() {
	FreezePlayer()

	function onGameLoaded() {
		utils.timers.setTimeout(() => {
			HideLoading()
			Tutorial.TriggerTutorial()
		}, GameSettings.LOADING_SCREEN_DELAY) 
		// TODO: fix this. The hard-coded wait is only because teleporting to the world/loading directly into it makes the tutorial not work
	}

	
	// Wait for scene to load and then 
	var hasEnteredScene = false
	var tutorialHasRun = false

	onEnterScene(() => hasEnteredScene = true)

	function waitForLoad() {
		if (tutorialHasRun) return

		// Wait for userData to be available
		let userData = getPlayer()
		if(!userData)                                  {console.log("waitForLoad: userData");        return}

		if (!hasEnteredScene)                          {console.log("waitForLoad: onEnterScene");    return}
		if (!Transform.getOrNull(engine.PlayerEntity)) {console.log("waitForLoad: PlayerEntity");    return}
		if (!Transform.getOrNull(engine.CameraEntity)) {console.log("waitForLoad: CameraEntity");    return}
		if (!MannequinManager.avatarHasLoaded)         {console.log("waitForLoad: avatarHasLoaded"); return}

		tutorialHasRun = true
		engine.removeSystem(waitForLoad)

		onGameLoaded()
	}

	// MARK: Init systems
	const store = ClientStore.getInstance()
	await store.init()
	ClientHandler.init()
	gameStateHandler.init()

	CameraController.init()
	NPCWinner.Init()
	OutfitManager.init()
	ShopManager.init()
	SoundManager.init()
	StageController.init()
	

	SetupColorPickers()
	SetupLights()
	SetupPortal()
	SetupUI()
	SpawnBirds()
	
	MannequinManager.init() // Comes after OutfitManager.init()

	// Wait for load, to trigger Tutorial
	engine.addSystem(waitForLoad)
}
