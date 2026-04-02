import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { ClientStore } from '../clientStore'
import { GameStatus } from 'src/shared/enums'
const clientStore = ClientStore.getInstance()


// Placeholders for dynamic content
export var visibleGameStatus: boolean = true

export function ShowGameStatus() {
	visibleGameStatus = true
}
export function HideGameStatus() {
	visibleGameStatus = false
}

function getStatusImage() {
	const status = clientStore.getServerStatus()
	switch (status) {
		case GameStatus.LOBBY:
			return "assets/images/ui/text-idle.png"
		case GameStatus.STARTING:
			return "assets/images/ui/text-game-starting.png"
		case GameStatus.ROUND_ACTIVE:
			return "assets/images/ui/text-game-in-progress.png"
		case GameStatus.VOTING:
			return "assets/images/ui/text-voting-in-progress.png"
		case GameStatus.GAME_ENDED:
			return "assets/images/ui/text-voting-finished.png"
	}
}


function getTimeToGameStart() {
	const gameStartTime = clientStore.getGameStartTime()
	const timeToGameStart = Math.ceil((gameStartTime - Date.now()) / 1000)
	return timeToGameStart > 0 ? timeToGameStart : "GO!"
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
					justifyContent: 'center',
					margin        : { top: '35px' },
					display       : visibleGameStatus ? 'flex' : 'none'
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-status.png"
					},
					textureMode: "stretch",

				}}
			>
				<UiEntity
					key={`ui_GameStatus_status`}
					uiTransform={{
						width : 241,
						height: 49,
						margin: { right: 0 },
					}}
					uiBackground={{
						texture: {
							src: getStatusImage()
						},
						textureMode: "stretch",
						color: Color4.White()

					}}
				/>
				<UiEntity
					key={`ui_GameStatus_value`}
					uiTransform={{
						width : 241,
						height: 49,
						margin: { right: 0 },
						display       : clientStore.getServerStatus() == GameStatus.STARTING ? 'flex' : 'none'
					}}
					uiText={{
						value    : getTimeToGameStart().toString(),
						fontSize : 64,
						textAlign: "middle-center",
						color    : Color4.White()
					}}
				/>
			</UiEntity>
		</UiEntity>
	)
}
