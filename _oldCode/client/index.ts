

import { ClientHandlers } from './clientHandler'
import { CameraController } from './cameraController'
//import { GameManager } from './gameManager'
import { OutfitManager } from './outfitManager'
import { ShopManager } from './shopManager'
import { SoundManager } from './soundManager'
import { StageController } from './stageController'

import { SetupLights } from './lights'
import { SetupColorPickers } from './colorPickers'

import { SetupUI }  from './ui'
import { ShowHowToPlay } from './ui/ui.game.howToPlay'

declare var process: {
	env: {
		NODE_ENV: string
	}
}
const DEBUG = process.env.NODE_ENV == "development"

export function initClient(): void {
	ClientHandlers.init()

	CameraController.init()

	//GameManager.init()
	ShopManager.init()
	SoundManager.init()
	StageController.init()
	OutfitManager.init()

	SetupColorPickers()
	SetupLights()
	SetupUI()

	if (!DEBUG) {
		ShowHowToPlay()
	}
}
