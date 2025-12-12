import { engine, Transform } from '@dcl/sdk/ecs'

import ReactEcs, {
	Button, Label,
	ReactEcsRenderer, UiEntity
} from '@dcl/sdk/react-ecs'

import { Color4, Vector3 } from '@dcl/sdk/math'



import { MessageBus } from '@dcl/sdk/message-bus'
const sceneMessageBus = new MessageBus()

export function DebugUI() {
	return (
		<UiEntity
			key="ui_debug_root"
			uiTransform={{
				width: 220,
				height: 600,
				flexDirection: 'column',
				alignItems: 'flex-start',
				justifyContent: 'space-between',
				margin: { top: '-220px', right: '50px' },
				padding: '10px',
				position: { right: 0, top: 300 },
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
				value='Teleport Menu'
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