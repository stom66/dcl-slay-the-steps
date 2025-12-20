import ReactEcs, { Button, Label, ReactEcsRenderer, TextureMode, UiEntity } from '@dcl/sdk/react-ecs'

import { Color3, Color4, Vector3 } from '@dcl/sdk/math'

import { MessageBus } from '@dcl/sdk/message-bus'
import { _GameManager, GameStatus, localPlayer } from './GameManager'
import { GetBackgroundTexture, GetPlayerName } from './utils'


// Placeholders for dynamic content
let playerList   : any[]  = [];
var visiblePlayerList : boolean = false

export function ShowPlayerList() {
	console.log("ShowPlayerList()")
	visiblePlayerList = true
}
export function HidePlayerList() {
	console.log("HidePlayerList()")
	visiblePlayerList = false
}

// MARK: BuildPlayerList
function BuildPlayerList() {
	let elements: any[] = []

	// Defensive check: ensure _GameManager is initialized
	if (!_GameManager || !_GameManager.state) {
		return elements
	}

	let gameStateImage = "assets/images/ui/text-idle.png"
	switch (_GameManager.state.gameState) {
		case GameStatus.STARTING:
			gameStateImage = "assets/images/ui/text-game-starting.png"
			break
		case GameStatus.ROUND_ACTIVE:
			gameStateImage = "assets/images/ui/text-game-in-progress.png"
			break
		case GameStatus.VOTING:
			gameStateImage = "assets/images/ui/text-voting-in-progress.png"
			break
		case GameStatus.GAME_ENDED:
			gameStateImage = "assets/images/ui/text-voting-finished.png"
			break
	}

	_GameManager.state.players.forEach((userId: string) => {
		const currentIndex = elements.length;
		const isEven = currentIndex % 2 === 0;
		const backgroundTexture = GetBackgroundTexture(isEven)

		elements.push(
			<UiEntity
				key={`player_${userId}_root`}
				uiTransform={{
					width         : "100%",
					height        : 42,
					padding       : { left: 10, right: 10 },
					flexGrow      : 1,
					flexDirection : 'row',
					alignItems    : 'center',
					justifyContent: 'flex-start',
					margin        : { bottom: 4 },
					display       : visiblePlayerList ? 'flex': 'none',
				}}
				uiBackground={{
					texture: {
						src: backgroundTexture
					},
					textureMode: "nine-slices",
					textureSlices: {
						top   : 0.25,
						bottom: 0.75,
						left  : 0.5,
						right : 0.5
					}
				}}
			>
				<UiEntity
					key={`player_${userId}_avatar`}
					uiTransform={{
						width : 40,
						height: 40,
						margin: { right: 10 },
					}}
					uiBackground={{
						avatarTexture: { userId: userId },
						textureMode  : "stretch"
					}}
				/>
				<Label
					key={`player_${userId}_label`}
					uiTransform={{
						height  : 40,
						flexGrow: 1,
					}}
					fontSize  = {16}
					font      = 'sans-serif'
					value     = {GetPlayerName(userId)}
					textWrap  = 'nowrap'
					textAlign = "middle-right"
					color     = {Color4.Black()}
				/>
			</UiEntity>
		)
	})

	if (elements.length < 1) {
		elements.push(
			<UiEntity
				key={`player_list_empty`}
				uiTransform={{
					width    : 240,
					height   : 48,
					alignSelf: "center",
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/text-no-players.png"
					},
					textureMode: "stretch",
				}}
			></UiEntity>
		)
	}

	console.log("BuildPlayerList()", elements)
	return elements
}


// MARK: UpdatePlayerList
export function UpdatePlayerList() {
	playerList = BuildPlayerList()
}

UpdatePlayerList()


// MARK: Main GameUI
export function PlayerListUI() {
	return (
		<UiEntity
			key={`ui_PlayerList_root`}
			uiTransform={{
				width         : 300,
				positionType  : "absolute",
				position      : { top: '100px', right: '64px' },
				flexGrow      : 1,
				flexDirection : 'column',
				alignItems    : 'flex-start',
				justifyContent: 'flex-start',
				display       : 'flex',
				padding       : { left: 18, bottom: 22, right: 18, top: 0 }
			}}
			uiBackground={{
				texture: {
					src: "assets/images/ui/bg-square-border.png"
				},
				textureMode: "nine-slices",
				textureSlices: {
					top   : 0.4,
					bottom: 0.6,
					left  : 0.5,
					right : 0.5
				}
			}}
		>
			<UiEntity
				uiTransform={{
					width         : 90,
					height        : 60,
					positionType  : "relative",
					position      : { top: -22 },
					display       : "flex",
					alignSelf     : "center",
					alignItems    : "center",
					justifyContent: "center",
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-square.png"
					},
					textureMode: "nine-slices",
					textureSlices: {
						top   : 0.4,
						bottom: 0.6,
						left  : 0.5,
						right : 0.5
					}
				}}
			>

				<UiEntity
					uiTransform={{
						width : 75,
						height: 50,
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/icon-neon-cat.png"
						},
						textureMode: "stretch",
					}}
				/>
			</UiEntity>
			<UiEntity
				key={`ui_PlayerList_header`}
				uiTransform={{
					width    : 240,
					height   : 48,
					margin   : { top: -32 },
					alignSelf: "center",
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/text-players.png"
					},
					textureMode: "stretch",
				}}
			>
			</UiEntity>

			{playerList}
		</UiEntity>
	)
}
