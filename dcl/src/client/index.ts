import { SetupUI }  from './ui'
import { ShowHowToPlay } from './ui/ui.Game.HowToPlay'

import { CameraController } from './CameraController'
import { GameManager } from './GameManager'
import { OutfitManager } from './OutfitManager'
import { ShopManager } from './ShopManager'
import { SoundManager } from './SoundManager'
import { StageController } from './StageController'

import { SetupLights } from './Lights'
import { SetupColorPickers } from './ColorPickers'

declare var process: {
	env: {
		NODE_ENV: string
	}
}
const DEBUG = process.env.NODE_ENV == "development"

export function mainClient(): void {
	CameraController.init()

	GameManager.init()
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
