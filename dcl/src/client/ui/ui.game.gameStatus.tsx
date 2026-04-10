import ReactEcs, { Button, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { GameStatus } from 'src/shared/enums'
import { GameSettings } from 'src/shared/settings'
import { NotifyTurnStartingPayload } from 'src/shared/types'
import { eventBus } from 'src/shared/utils/eventBus'
import { clockSync } from 'src/shared/utils/clockSync'

import { ClientStore } from 'src/client/clientStore'
import { ClientEvents } from 'src/client/clientEvents'
import { ShowHowToPlay } from './ui.game.howToPlay'
import { ClientMessaging } from '../clientMessaging'
import { SoundManager } from '../soundManager'
import { sfx } from '../data/sfx'


// MARK: Event Bindings
eventBus.on(ClientEvents.NOTIFY_TURN_STARTING, (data: NotifyTurnStartingPayload) => {
	playerName     = data.displayName
	roundStartTime = clockSync.toLocalTime(data.sentAt)
})


// MARK: Vars
const clientStore = ClientStore.getInstance()

var playerName    : string = "Dave the Dapper"
var roundStartTime: number = 0
var isHovered     : boolean = false


function getStatusBackground() {
	const status = clientStore.getServerStatus()
	//return "assets/images/ui/bg-status-round-active.png"
	return "assets/images/ui/bg-status-" + status.toLowerCase().replace("_", "-") + ".png"
}

function getButtonBackground(isHoveredButton?: boolean) {
	var path = "assets/images/ui/btn-"
	switch (clientStore.getServerStatus()) {
		case GameStatus.LOBBY:
			path += "start-game"
			break
		case GameStatus.STARTING:
			path += "join-game"
			break
		case GameStatus.STARTED:
		case GameStatus.ROUND_ACTIVE:
			path += "spectate-game"
			break
	}
	return path + (isHoveredButton ? "-hover" : "") + ".png"
}

function shouldShowButton() {
	const isInGame = clientStore.isEnrolledInGame() || clientStore.isSpectatorInGame()
	const status = clientStore.getServerStatus()
	return (status == GameStatus.LOBBY || status == GameStatus.STARTING || status == GameStatus.STARTED || status == GameStatus.ROUND_ACTIVE) && !isInGame

}


function getTimeToGameStart() {
	const gameStartTime = clientStore.getGameStartTime()
	const timeToGameStart = Math.ceil((gameStartTime - Date.now()) / 1000)
	return timeToGameStart > 0 ? timeToGameStart : "60"
}

function getRoundTimeRemaing() {
	const timeRemaining = Math.ceil((roundStartTime + GameSettings.ROUND_DURATION_PER_PLAYER - Date.now()) / 1000)
	return timeRemaining > 0 ? timeRemaining : "~"
}

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
					margin        : { top: '35px' },
					display       : 'flex'
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
			<UiEntity
				key={`ui_GameStatus_btn_parent`}
				uiTransform={{
					width : "180",
					height: "56",
					display: shouldShowButton() ? 'flex' : 'none',
					position: { top: -28}
				}}
				uiBackground={{
					texture: {
						src: getButtonBackground()
					},
					textureMode: "stretch",
				}}
				onMouseDown={() => {
					//ShowHowToPlay()
					var status = clientStore.getServerStatus()
					if (status == GameStatus.LOBBY || status == GameStatus.STARTING) {
						console.log("npcGameHost: updateGameHostNPC: Requesting to join game")
						ClientMessaging.RequestJoinGame()
						SoundManager.PlaySound(sfx.startGame)

					} else if (status == GameStatus.STARTED || status == GameStatus.ROUND_ACTIVE) {
						console.log("npcGameHost: updateGameHostNPC: Requesting to spectate game")
						SoundManager.PlaySound(sfx.startGame)
						ClientMessaging.RequestJoinGameAsSpectator()

					} else {
						console.log("npcGameHost: updateGameHostNPC: Status not LOBBY/STARTING/STARTED/ROUND_ACTIVE")
						eventBus.emit(ClientEvents.NOTIFY_WARNING, "Please wait for the next game to start")
					}
					
				}}
				onMouseEnter={() => {
					isHovered = true
				}}
				onMouseLeave={() => {
					isHovered = false
				}}
			>
				<UiEntity
					key={`ui_GameStatus_btn_parent`}
					uiTransform={{
						width : "100%",
						height: "100%",
						display: isHovered ? 'flex' : 'none',
					}}
					uiBackground={{
						texture: {
							src: getButtonBackground(true)
						},
						textureMode: "stretch",
					}}
				/>

			</UiEntity>
		</UiEntity>
	)
}
