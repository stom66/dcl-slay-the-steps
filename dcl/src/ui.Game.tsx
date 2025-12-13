import ReactEcs, {
	Button, Label,
	ReactEcsRenderer, TextureMode, UiEntity
} from '@dcl/sdk/react-ecs'

import { Color3, Color4, Vector3 } from '@dcl/sdk/math'

import { MessageBus } from '@dcl/sdk/message-bus'
import { _GameManager, GameStatus } from './GameManager'
import { GetPlayerNameFromUserId } from './utils'
const sceneMessageBus = new MessageBus()

// Root Element visibility
var visibleHowToPlay: boolean = false
var visiblePlayerList: boolean = true

// Placeholders for dynamic content
let playerList: any[] = [];



// MARK: UpdatePlayerList
export function UpdatePlayerList() {
	playerList = BuildPlayerList()
}

function BuildPlayerList() {
	let elements: any[] = []
	_GameManager.state.players.forEach((playerId: string) => {
		elements.push(
			<UiEntity
				key={`player_${playerId}_root`}
				uiTransform={{
					width: "100%",
					height: 100,
				}}

				uiText={{
					fontSize: 16,
					font: 'sans-serif',
					value: GetPlayerNameFromUserId(playerId),
					textWrap: 'nowrap',
					textAlign: 'middle-right'
				}}
			>
			</UiEntity>
		)
	})
	return elements
}



// MARK: Main GameUI
export function GameUI() {
	return (
		<UiEntity
			key={`ui_root`}
			uiTransform={{
				width: '100%',
				height: '100%',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-start',
				positionType: "absolute",
			}}
		>

			{/* 
				MARK: How To Play
			*/}
			<UiEntity
				key={`ui_HowToPlay_root`}
				uiTransform={{
					width: 720,
					height: 369,
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'space-between',
					margin: { bottom: '35px' },
					display: visibleHowToPlay ? 'flex' : 'none'
				}}
				uiBackground={{
					texture: {
						src: "images/how-to-play.png"
					},
					textureMode: "stretch"

				}}
			>
			</UiEntity>


			{/* 
				MARK: Player List
			*/}
			<UiEntity
				key={`ui_PlayerList_root`}
				uiTransform={{
					width: 300,
					height: 260,
					positionType: "absolute",
					position: { top: '100px', right: '64px' },
					flexShrink: 1,
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'flex-start',
					margin: { bottom: '35px' },
					display: 'flex'
				}}
				uiBackground={{
					texture: {
						src: "images/round-scores.png"
					},
					textureMode: "stretch",
					color: Color4.Red()

				}}
			>
				<UiEntity
					key={`ui_PlayerList_header`}
					uiTransform={{
						width: "100%",
						height: 64,
					}}
					uiText={{
						value: "Player List",
						fontSize: 24,
						textAlign: "middle-center",
					}}
				>

				</UiEntity>

				{playerList}
			</UiEntity>

			{/* 
			MARK: Countdown timer
			*/}
			<UiEntity
				key={`ui_CountdownTimer_root`}
				uiTransform={{
					width: 240,
					height: 140,
					flexShrink: 0,
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'center',
					margin: { top: '35px' },
					display: _GameManager.countdownValue > 0 ? 'flex' : 'none'
				}}
				uiBackground={{
					texture: {
						src: "images/round-scores.png"
					},
					textureMode: "stretch",
					color: Color4.Red()

				}}
			>
				<UiEntity
					key={`ui_CountdownTimer_header`}
					uiTransform={{
						width: "100%",
						height: 64,
					}}
					uiText={{
						value: "Countdown Timer",
						fontSize: 24,
						textAlign: "middle-center",
					}}
				/>
				<UiEntity
					key={`ui_CountdownTimer_value`}
					uiTransform={{
						width: "100%",
						height: 64,
					}}
					uiText={{
						value: _GameManager.countdownValue.toString(),
						fontSize: 64,
						textAlign: "middle-center",
					}}
				/>


			</UiEntity>
		</UiEntity>
	)
}


// MARK: Show/Hide Funcs
export function ShowHowToPlay() {
	console.log("ShowHowToPlay()")
	visibleHowToPlay = true
}
export function HideHowToPlay() {
	visibleHowToPlay = false
}

export function ShowPlayerList() {
	console.log("ShowPlayerList()")
	visiblePlayerList = true
}
export function HidePlayerList() {
	console.log("HidePlayerList()")
	visiblePlayerList = false
}