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
	_StageController.init()
	_ShopManager.init()
	_CameraController.init()

	// Spawn some lights
	const lightDownstairs = engine.addEntity()
	Transform.create(lightDownstairs, {
		position: Vector3.create(16, 9, 16),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale: Vector3.create(1, 1, 1)
	})
	LightSource.create(lightDownstairs, {
		type     : LightSource.Type.Point({}),
		intensity: 999999 / 6,
		shadow   : false,
		color    : Color3.White(),
		active   : true
	})


	const lightUpstairs = engine.addEntity()
	Transform.create(lightUpstairs, {
		position: Vector3.create(16, 18, 16),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale: Vector3.create(1, 1, 1)
	})
	LightSource.create(lightUpstairs, {
		type     : LightSource.Type.Point({}),
		intensity: 999999 / 6,
		shadow   : false,
		color    : Color3.White(),
		active   : true
	})


	const lightStairsTop = engine.addEntity()
	Transform.create(lightStairsTop, {
		position: Vector3.create(16, 21.1, 29.25),
		rotation: Quaternion.fromEulerDegrees(90, 0, 0),
		scale: Vector3.create(1, 1, 1)
	})
	LightSource.create(lightStairsTop, {
		type     : LightSource.Type.Spot({ innerAngle: 25, outerAngle: 45 }),
		intensity: 999999 / 6,
		shadow   : false,
		color    : Color3.White(),
		active   : true
	})
}
