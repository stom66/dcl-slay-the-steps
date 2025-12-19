import { Color3, Quaternion, Vector3 } from '@dcl/sdk/math'
import { engine, Transform, GltfContainer, LightSource } from '@dcl/sdk/ecs'
//
// Note the 180 rotation, this is so that position in Blender align with positions in DCL (with Y and Z swapped)

import { SceneSettings, GameSettings } from "./_settings"
import { setupUi }  from './ui'
import { _GameManager } from './GameManager'
import { _StageController } from './StageController'
import { _ShopManager } from './ShopManager'
import { ShowWarning } from './ui.Game'
import { _CameraController } from './CameraController'
import { _SoundManager } from './SoundManager'

import { SetupLights } from './Lights'

export function main() {
	
	_GameManager.init()
	_StageController.init()
	_ShopManager.init()
	_CameraController.init()
	_SoundManager.init()

	SetupLights()
	setupUi()
}
