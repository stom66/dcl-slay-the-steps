import { setupUi }  from './ui'
import { ShowHowToPlay } from './ui.Game.HowToPlay'

import { _CameraController } from './CameraController'
import { _GameManager } from './GameManager'
import { _OutfitManager } from './OutfitManager'
import { _ShopManager } from './ShopManager'
import { _SoundManager } from './SoundManager'
import { _StageController } from './StageController'

import { SetupLights } from './Lights'


export function main() {
	_CameraController.init()
	_GameManager.init()
	_ShopManager.init()
	_SoundManager.init()
	_StageController.init()
	_OutfitManager.init()

	SetupLights()
	setupUi()

	ShowHowToPlay()
}
