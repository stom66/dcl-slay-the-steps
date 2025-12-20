import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { _GameManager } from './GameManager'
import { CountdownTimerUI, visibleCountdownTimer } from './ui.Game.CountdownTimer'
import { PlayerListUI } from './ui.Game.PlayerList'
import { VotingOptionsUI } from './ui.Game.VotingOptions'
import { VotingResultsUI } from './ui.Game.VotingResults'
import { WarningUI } from './ui.Game.Warning'


// MARK: Main GameUI
export function GameUI() {

	return (
		<UiEntity
			key={`ui_root`}
			uiTransform={{
				width         : '100%',
				height        : '100%',
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: visibleCountdownTimer ? 'flex-start': 'center',
				positionType  : "absolute",
			}}
		>
			{VotingOptionsUI()}
			{VotingResultsUI()}
			{PlayerListUI()}
			{WarningUI()}
			{CountdownTimerUI()}
		</UiEntity>
	)
}