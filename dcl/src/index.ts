import { setupUi }  from './ui'
import { ShowWarning } from './ui.Game.Warning'

import { _CameraController } from './CameraController'
import { _GameManager } from './GameManager'
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

	SetupLights()
	setupUi()
}
