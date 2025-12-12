import { UiEntity, ReactEcs } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'


export const TestUI = () => (
	// parent
	<UiEntity
		uiTransform={{
			width: '300px',
			height: '300px',
			alignContent: 'center',
			justifyContent: 'center',
			display: 'flex'
		}}
		uiText={{
			value: "Menu",
			fontSize: 128
		}}
		uiBackground={{ color: Color4.Green() }}
	/>
)