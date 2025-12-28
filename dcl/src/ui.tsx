import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'

import { DebugUI } from './ui.Debug'

import { CountdownTimerUI } from './ui.Game.CountdownTimer'
import { VotingOptionsUI } from './ui.Game.VotingOptions'
import { VotingResultsUI } from './ui.Game.VotingResults'
import { PlayerListUI } from './ui.Game.PlayerList'
import { WarningUI } from './ui.Game.Warning'
import { YouAreNextUI } from './ui.Game.YouAreNext'
import { HowToPlayUI } from './ui.Game.HowToPlay'
import { EmotesHintUI } from './ui.Game.Emotes'

declare var process: {
	env: {
		NODE_ENV: string
	}
}
const env = process.env.NODE_ENV
const SHOW_DEBUG = env == "development"

const uiComponent = () => [
	CountdownTimerUI(),
	VotingOptionsUI(),
	VotingResultsUI(),
	PlayerListUI(),
	WarningUI(),
	YouAreNextUI(),
	HowToPlayUI(),
	EmotesHintUI(),
	SHOW_DEBUG ? DebugUI() : null
]

export function setupUi() {
	console.log("Setup UI")
	ReactEcsRenderer.setUiRenderer(uiComponent)
}
