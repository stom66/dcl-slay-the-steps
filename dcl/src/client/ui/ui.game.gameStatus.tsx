import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { ClientStore } from 'src/client/clientStore'
import { GameStatus } from 'src/shared/enums'
import { eventBus } from 'src/shared/utils/eventBus'
import { ClientEvents } from '../clientEvents'
import { NotifyTurnStartingPayload } from 'src/shared/types'
import { clockSync } from 'src/shared/utils/clockSync'
const clientStore = ClientStore.getInstance()


// Placeholders for dynamic content
export var visibleGameStatus: boolean = true
var playerName    : string = "Dave the Dapper"
var roundStartTime: number = 0

export function ShowGameStatus() {
	visibleGameStatus = true
}
export function HideGameStatus() {
	visibleGameStatus = false
}

function getStatusBackground() {
	const status = clientStore.getServerStatus()
	//return "assets/images/ui/bg-status-round-active.png"
	return "assets/images/ui/bg-status-" + status.toLowerCase().replace("_", "-") + ".png"
}


function getTimeToGameStart() {
	const gameStartTime = clientStore.getGameStartTime()
	const timeToGameStart = Math.ceil((gameStartTime - Date.now()) / 1000)
	return timeToGameStart > 0 ? timeToGameStart : "60"
}

function getRoundTimeRemaing() {
	const timeRemaining = Math.ceil((roundStartTime - Date.now()) / 1000)
	return timeRemaining > 0 ? timeRemaining : "~"
}

eventBus.on(ClientEvents.NOTIFY_TURN_STARTING, (data: NotifyTurnStartingPayload) => {
	playerName     = data.displayName
	roundStartTime = clockSync.toLocalTime(data.sentAt)
})

// MARK: Main GameUI
export function GameStatusUI() {
	return (
		<UiEntity
			key={`ui_GameStatus_root`}
			uiTransform={{
				width         : '100%',
				height        : '100%',
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: 'flex-start',
				positionType  : "absolute",
			}}
		>
			<UiEntity
				key={`ui_GameStatus_body`}
				uiTransform={{
					width         : 400,
					height        : 120,
					flexShrink    : 0,
					flexDirection : 'row',
					alignItems    : 'center',
					justifyContent: 'flex-end',
					
					// justifyContent: clientStore.getServerStatus() == GameStatus.STARTING ? 'flex-end' : 'none'
					margin        : { top: '35px' },
					display       : visibleGameStatus ? 'flex' : 'none'
				}}
				uiBackground={{
					texture: {
						src: getStatusBackground()
					},
					textureMode: "stretch",

				}}
			>
				<UiEntity
					key={`ui_GameStatus_playerName`}
					uiTransform={{
						width : "50%",
						height: "100%",
						//display: 'flex',
						margin: { bottom: '58px' },
						display: clientStore.getServerStatus() == GameStatus.ROUND_ACTIVE ? 'flex' : 'none'
					}}
					uiText={{
						value    : `${playerName}`,
						fontSize : 24,
						textAlign: "bottom-center",
						color    : Color4.White(),
					}}
					uiBackground={{
						//color: Color4.Green()
					}}
				/>
				<UiEntity
					key={`ui_GameStatus_timerValue`}
					uiTransform={{
						width    : "25%",
						height   : "100%",
						display: clientStore.getServerStatus() == GameStatus.STARTING || clientStore.getServerStatus() == GameStatus.ROUND_ACTIVE ? 'flex' : 'none'
						//display  : 'flex',

					}}
					uiText={{
						value    : clientStore.getServerStatus() == GameStatus.STARTING ? getTimeToGameStart().toString() : getRoundTimeRemaing().toString(),
						fontSize : 64,
						textAlign: "middle-center",
						color    : Color4.White(),
					}}
					uiBackground={{
						//color: Color4.Green()
					}}
				/>
			</UiEntity>
		</UiEntity>
	)
}
