import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { engine, Transform, GltfContainer } from '@dcl/sdk/ecs'
//
// Note the 180 rotation, this is so that position in Blender align with positions in DCL (with Y and Z swapped)

import { Settings } from "./_settings"
import { setupUi }  from './ui'
import { _GameManager } from './GameManager'

export function main() {
	
	setupUi()

	_GameManager.init()
}
