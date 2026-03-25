import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'

import { DebugUI } from './ui/ui.debug'

//import { CountdownTimerUI } from './ui/ui.game.countdownTimer'
//import { EmotesHintUI } from './ui/ui.game.emotes'
import { HowToPlayUI } from './ui/ui.game.howToPlay'
//import { PlayerListUI } from './ui/ui.game.playerList'
//import { VotingOptionsUI } from './ui/ui.game.votingOptions'
//import { VotingResultsUI } from './ui/ui.game.votingResults'
//import { WarningUI } from './ui/ui.game.warning'
//import { YouAreNextUI } from './ui/ui.game.youAreNext'

declare var process: {
	env: {
		NODE_ENV: string
	}
}
const env = process.env.NODE_ENV
const SHOW_DEBUG = env == "development"

const uiComponent = () => [
	//CountdownTimerUI(),
	//VotingOptionsUI(),
	//VotingResultsUI(),
	//PlayerListUI(),
	//WarningUI(),
	//YouAreNextUI(),
	HowToPlayUI(),
	//EmotesHintUI(),
	SHOW_DEBUG ? DebugUI() : null
]

export function SetupUI() {
	ReactEcsRenderer.setUiRenderer(uiComponent)
}
