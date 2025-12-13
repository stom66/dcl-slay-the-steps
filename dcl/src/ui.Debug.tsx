import { engine, Transform } from '@dcl/sdk/ecs'

import ReactEcs, {
	Button, Label,
	ReactEcsRenderer, UiEntity
} from '@dcl/sdk/react-ecs'

import { Color4, Vector3 } from '@dcl/sdk/math'



import { MessageBus } from '@dcl/sdk/message-bus'
import { _GameManager, localPlayer } from './GameManager'
const sceneMessageBus = new MessageBus()

export function DebugUI() {
	return (
		<UiEntity
			key="ui_debug_root"
			uiTransform={{
				width: 220,
				height: 400,
				flexDirection: 'column',
				alignItems: 'flex-start',
				justifyContent: 'space-between',
				margin: { top: '-220px', right: '50px' },
				padding: '10px',
				position: { left: 50, top: 350 },
				positionType: "absolute"
			}}
			uiBackground={{ color: Color4.fromHexString("#4C958133") }}
		>

			<Label
				key="title"
				uiTransform={{
					width: 180, height: 40, margin: 8,
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'space-between'
				}}
				value='DEBUG Menu'
				color={Color4.White()}
				fontSize={14}
				textAlign="middle-left"
			/>

			<Label
				key="timestamp"
				uiTransform={{
					width: 180, height: 40, margin: 8,
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'space-between'
				}}
				value={`timestamp: ${_GameManager.utcTimestamp}`}
				color={Color4.White()}
				fontSize={14}
				textAlign="middle-left"
			/>

			<Label
				key="title"
				uiTransform={{
					width: 180, height: 40, margin: 8,
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'space-between'
				}}
				value={`gameState: ${_GameManager.state.gameState}`}
				color={Color4.White()}
				fontSize={14}
				textAlign="middle-left"
			/>

			<Label
				key="amIHost"
				uiTransform={{
					width: 180, height: 40, margin: 8,
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'space-between'
				}}
				value={`IAmTheHost: ${_GameManager.IAmTheHost ? "TRUE" : "FALSE"}`}
				color={Color4.White()}
				fontSize={14}
				textAlign="middle-left"
			/>

			<Label
				key="amIInTheGame"
				uiTransform={{
					width: 180, height: 40, margin: 8,
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'space-between'
				}}
				value={`InTheGame: ${_GameManager.state.players.includes(localPlayer?.userId) ? "TRUE" : "FALSE"}`}
				color={Color4.White()}
				fontSize={14}
				textAlign="middle-left"
			/>


			<Label
				key="hostPlayerId"
				uiTransform={{
					width: 180, height: 40, margin: 8,
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'space-between'
				}}
				value={`hostPlayerId: ${_GameManager.state.hostPlayerId}`}
				color={Color4.White()}
				fontSize={14}
				textAlign="middle-left"
			/>


			<Button
				key="eventUpdate"
				uiTransform={{ width: 180, height: 40, margin: 8 }}
				value='EmitEvent: UpdateLeaderboard'
				variant='primary'
				fontSize={14}
				onMouseDown={() => {
					sceneMessageBus.emit('UpdateLeaderboard', {})
				}}
			/>


		</UiEntity>
	)
}