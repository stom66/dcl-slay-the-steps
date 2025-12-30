import { setupUi }  from './ui'
import { ShowHowToPlay } from './ui.Game.HowToPlay'

import { _CameraController } from './CameraController'
import { _GameManager } from './GameManager'
import { _OutfitManager } from './OutfitManager'
import { _ShopManager } from './ShopManager'
import { _SoundManager } from './SoundManager'
import { _StageController } from './StageController'

import { SetupLights } from './Lights'
import { _ColorPickers } from './ColorPickers'

declare var process: {
	env: {
		NODE_ENV: string
	}
}
const DEBUG = process.env.NODE_ENV == "development"

export function main() {
	_CameraController.init()
	_GameManager.init()
	_ShopManager.init()
	_SoundManager.init()
	_StageController.init()
	_OutfitManager.init()
	_ColorPickers.init()

	SetupLights()
	setupUi()

	if (!DEBUG) {
		ShowHowToPlay()
	}
}
