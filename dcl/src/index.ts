import { _CameraController } from './CameraController'
import { _GameManager } from './GameManager'
import { _ShopManager } from './ShopManager'
import { _SoundManager } from './SoundManager'
import { _StageController } from './StageController'

import { SetupLights } from './Lights'

import { setupUi }  from './ui'
import { ShowWarning } from './ui.Game'

export function main() {
	
	_GameManager.init()
	_StageController.init()
	_ShopManager.init()
	_CameraController.init()
	_SoundManager.init()

	SetupLights()
	setupUi()
}
