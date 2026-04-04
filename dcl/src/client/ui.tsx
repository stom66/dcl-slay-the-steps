import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'

import { DebugUI } from 'src/client/ui/ui.debug'

import { GameStatusUI } from 'src/client/ui/ui.game.gameStatus'
import { EmotesHintUI } from 'src/client/ui/ui.game.emotes'
import { HowToPlayUI } from 'src/client/ui/ui.game.howToPlay'
import { PlayerListUI } from 'src/client/ui/ui.game.playerList'
//import { VotingOptionsUI } from 'src/client/ui/ui.game.votingOptions'
//import { VotingResultsUI } from 'src/client/ui/ui.game.votingResults'
import { WarningUI } from 'src/client/ui/ui.game.warning'
import { YouAreNextUI } from 'src/client/ui/ui.game.youAreNext'

declare var process: {
	env: {
		NODE_ENV: string
	}
}
const env = process.env.NODE_ENV
const SHOW_DEBUG = env == "development"

const uiComponent = () => [
	GameStatusUI(),
	//VotingOptionsUI(),
	//VotingResultsUI(),
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
