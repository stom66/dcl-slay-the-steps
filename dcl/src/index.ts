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

export function main() {
	
	setupUi()

	_GameManager.init()
	//_StageController.init()
	_ShopManager.init()
	_CameraController.init()

	// Spawn some lights
	const light = engine.addEntity()
	Transform.create(light, {
		position: Vector3.create(16, 32, 16),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale: Vector3.create(1, 1, 1)
	})
	LightSource.create(light, {
		active: true,
		color: Color3.create(1, 1, 1),
		intensity: 1000
	})
}
