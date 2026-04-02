import ReactEcs, { Button, Label, ReactEcsRenderer, UiEntity} from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { MessageBus } from '@dcl/sdk/message-bus'

//import { GameManager } from '../gameStateHandler'
//import { SeatManager } from '../SeatManager'
import { ShowHowToPlay } from './ui.game.howToPlay'
import { ClientStore } from '../clientStore'

const clientStore = ClientStore.getInstance()

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

			{/* <Button
				key         = "btnMoveToLobby"
				uiTransform = {{ width: 180, height: 40, margin: 8 }}
				value       = 'moveTo: lobby'
				variant     = 'primary'
				fontSize    = {14}
				onMouseDown = {() => {
					SeatManager.MovePlayerToLobby()
				}}
			/> */}


			{/* <Button
				key         = "btnMoveToLobby"
				uiTransform = {{ width: 180, height: 40, margin: 8 }}
				value       = 'moveTo: arena'
				variant     = 'primary'
				fontSize    = {14}
				onMouseDown = {() => {
					SeatManager.MovePlayerToSeat(Math.floor(Math.random() * 16))
				}}
			/> */}


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
			<Button
				key         = "btnShowHowToPlay"
				uiTransform = {{ width: 180, height: 40, margin: 8 }}
				value       = 'ShowHowToPlay'
				variant     = 'primary'
				fontSize    = {14}
				onMouseDown = {() => {
					ShowHowToPlay()
				}}
			/>




			<Label
				key            = "title-client"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = 'CLIENT:'
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>
			<Label
				key            = "client-userid"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`userId: ${clientStore.getUserId()}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>
			<Label
				key            = "client-displayName"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`displayName: ${clientStore.getDisplayName()}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>
			<Label
				key            = "client-enrolled"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`isEnrolledInGame: ${clientStore.isEnrolledInGame() ? "TRUE" : "FALSE"}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>




			<Label
				key            = "title-server"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = 'SERVER:'
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>
			<Label
				key            = "status"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`status: ${clientStore.getServerStatus()}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>
			
			<Label
				key            = "server-gamestart"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`gameStartTime: ${clientStore.getGameStartTime()}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>
			
			<Label
				key            = "server-players"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`players: ${clientStore.getPlayers().size}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>
			
			
			<Label
				key            = "server-votes"
				uiTransform    = {{
					width         : 180, 
					height        : 40, 
					margin        : 8,
					flexDirection : 'column',
					alignItems    : 'flex-start',
					justifyContent: 'space-between'
				}}
				value          = {`votes: ${clientStore.getServerState().votes.size}`}
				color          = {Color4.White()}
				fontSize       = {14}
				textAlign      = "middle-left"
			/>


		</UiEntity>
	)
}