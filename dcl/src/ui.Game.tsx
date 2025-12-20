import ReactEcs, { Button, Label, ReactEcsRenderer, TextureMode, UiEntity } from '@dcl/sdk/react-ecs'

import { Color3, Color4, Vector3 } from '@dcl/sdk/math'

import { MessageBus } from '@dcl/sdk/message-bus'
import { GetBackgroundTexture, GetPlayerAvatarImage, GetPlayerName, onPlayerProfileLoaded } from './utils'
import { PlayerListUI, UpdatePlayerList } from './ui.Game.PlayerList'
import { WarningUI } from './ui.Game.Warning'
import { CountdownTimerUI, visibleCountdownTimer } from './ui.Game.CountdownTimer'
import { HideVotingOptions, UpdateVotingOptions, VotingOptionsUI } from './ui.Game.VotingOptions'
import { _GameManager } from './GameManager'
import { UpdateVotingResults, VotingResultsUI } from './ui.Game.VotingResults'


// Add listeners for player profile loaded
onPlayerProfileLoaded((userId: string) => {
	UpdatePlayerList()
	UpdateVotingOptions()
	UpdateVotingResults()
})


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