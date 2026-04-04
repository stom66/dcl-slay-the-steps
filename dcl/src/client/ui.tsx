import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'

import { DebugUI } from 'src/client/ui/ui.debug'

import { EmotesHintUI } from 'src/client/ui/ui.game.emotes'
import { GameStatusUI } from 'src/client/ui/ui.game.gameStatus'
import { HowToPlayUI } from 'src/client/ui/ui.game.howToPlay'
import { PlayerListUI } from 'src/client/ui/ui.game.playerList'
import { VotingOptionsUI } from 'src/client/ui/ui.game.votingOptions'
import { VotingResultsUI } from 'src/client/ui/ui.game.votingResults'
import { WarningUI } from 'src/client/ui/ui.game.warning'
import { YouAreNextUI } from 'src/client/ui/ui.game.youAreNext'

// MARK: Vars
declare var process: {
	env: {
		NODE_ENV: string
	}
}
const env = process.env.NODE_ENV
const SHOW_DEBUG = env == "development"


// MARK: Main
const uiComponent = () => [
	EmotesHintUI(),
	GameStatusUI(),
	HowToPlayUI(),
	PlayerListUI(),
	VotingOptionsUI(),
	VotingResultsUI(),
	WarningUI(),
	YouAreNextUI(),
	SHOW_DEBUG ? DebugUI() : null
]

export function SetupUI() {
	ReactEcsRenderer.setUiRenderer(uiComponent)
}
