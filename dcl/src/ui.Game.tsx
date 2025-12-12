import ReactEcs, {
	Button, Label,
	ReactEcsRenderer, TextureMode, UiEntity
} from '@dcl/sdk/react-ecs'

import { Color3, Color4, Vector3 } from '@dcl/sdk/math'

import { MessageBus } from '@dcl/sdk/message-bus'
import { _GameManager } from './GameManager'
const sceneMessageBus = new MessageBus()

// Root Element visibility
var visibleHowToPlay: boolean = false
var visiblePlayerList: boolean = true

// Placeholders for dynamic content
let playerList: any[] = [];



// MARK: UpdatePlayerList
function UpdatePlayerList() {
	playerList = BuildPlayerList()
}

function BuildPlayerList() {
	let elements: any[] = []
	_GameManager.state.players.forEach((playerId: number) => {
		elements.push(
			<UiEntity
				key={`player_${playerId}_root`}
				uiTransform={{
					width: 100,
					height: 100,
				}}

				uiText={{
					fontSize: 16,
					font: 'sans-serif',
					value: playerId.toString(),
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
				justifyContent: 'flex-end',
				positionType: "absolute",
			}}

			uiBackground={{
				color: Color4.create(0.5, 0.8, 0.1, 0.6)
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
				key={`ui_RoundScores_root`}
				uiTransform={{
					width: 900,
					height: 247,
					flexDirection: 'row',
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

				{playerList}
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