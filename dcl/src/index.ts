import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { engine, Transform, GltfContainer } from '@dcl/sdk/ecs'
//
// Note the 180 rotation, this is so that position in Blender align with positions in DCL (with Y and Z swapped)

import { SceneSettings, GameSettings } from "./_settings"
import { setupUi }  from './ui'
import { _GameManager } from './GameManager'
import { _StageController } from './StageController'
import { _ShopManager } from './ShopManager'
import { ShowWarning } from './ui.Game'

export function main() {
	
	setupUi()

	_GameManager.init()
	//_StageController.init()
	_ShopManager.init()
}
