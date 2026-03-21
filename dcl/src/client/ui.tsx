import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'

import { DebugUI } from './ui/ui.Debug'

import { CountdownTimerUI } from './ui/ui.Game.CountdownTimer'
import { VotingOptionsUI } from './ui/ui.Game.VotingOptions'
import { VotingResultsUI } from './ui/ui.Game.VotingResults'
import { PlayerListUI } from './ui/ui.Game.PlayerList'
import { WarningUI } from './ui/ui.Game.Warning'
import { YouAreNextUI } from './ui/ui.Game.YouAreNext'
import { HowToPlayUI } from './ui/ui.Game.HowToPlay'
import { EmotesHintUI } from './ui/ui.Game.Emotes'

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

export function SetupUI() {
	ReactEcsRenderer.setUiRenderer(uiComponent)
}
