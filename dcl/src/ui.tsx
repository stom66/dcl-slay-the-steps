import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'

import { GameUI } from './ui.Game'
import { DebugUI } from './ui.Debug'
import { TestUI } from './ui.Test'

//declare var process: {
//	env: {
//		NODE_ENV: string
//	}
//}
//const env = process.env.NODE_ENV
//const SHOW_DEBUG = env == "development"
const SHOW_DEBUG = true

const uiComponent = () => [
	//TestUI(),
	GameUI(),
	SHOW_DEBUG ? DebugUI() : null
]

export function setupUi() {
	console.log("Setup UI")
	ReactEcsRenderer.setUiRenderer(uiComponent)
}
