import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity} from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { MessageBus } from '@dcl/sdk/message-bus'

import { GameManager, localPlayer } from '../GameManager'
import { SeatManager } from '../SeatManager'
import { ShowHowToPlay } from './ui.Game.HowToPlay'

const sceneMessageBus = new MessageBus()

export function DebugUI() {
	return (
		<UiEntity
			key="ui_debug_root"
			uiTransform={{
				width         : 220,
				height        : 400,
				flexDirection : 'column',
				alignItems    : 'flex-start',
				justifyContent: 'space-between',
				margin        : { top: '-220px', right: '50px' },
				padding       : '10px',
				position      : { left: 50, top: 350 },
				positionType: "absolute"
			}}
			uiBackground={{ color: Color4.fromHexString("#4C958133") }}
		>

			<Button
				key         = "btnMoveToLobby"
				uiTransform = {{ width: 180, height: 40, margin: 8 }}
				value       = 'moveTo: lobby'
				variant     = 'primary'
				fontSize    = {14}
				onMouseDown = {() => {
					SeatManager.MovePlayerToLobby()
				}}
			/>


			<Button
				key         = "btnMoveToLobby"
				uiTransform = {{ width: 180, height: 40, margin: 8 }}
				value       = 'moveTo: arena'
				variant     = 'primary'
				fontSize    = {14}
				onMouseDown = {() => {
					SeatManager.MovePlayerToSeat(Math.floor(Math.random() * 16))
				}}
			/>


			<Button
				key         = "btnMoveToLobby"
				uiTransform = {{ width: 180, height: 40, margin: 8 }}
				value       = 'ShowHowToPlay'
				variant     = 'primary'
				fontSize    = {14}
				onMouseDown = {() => {
					ShowHowToPlay()
				}}
			/>
			<Label
				key            = "title"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = 'DEBUG Menu'
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>

			<Label
				key            = "timestamp"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`timestamp: ${GameManager.utcTimestamp}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>

			<Label
				key            = "title"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`gameState: ${GameManager.state.gameState}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>

			<Label
				key            = "amIHost"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`IAmTheHost: ${GameManager.iAmTheHost ? "TRUE" : "FALSE"}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>

			<Label
				key            = "amIInTheGame"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`IAmInTheGame: ${GameManager.state.players.includes(localPlayer?.userId) ? "TRUE" : "FALSE"}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>


			<Label
				key            = "hostUserId"
				uiTransform    = {{
					width         : 180, height: 40, margin: 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`hostUserId: ${GameManager.state.hostUserId}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>


		</UiEntity>
	)
}