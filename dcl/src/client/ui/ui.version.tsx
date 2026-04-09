import ReactEcs, { Button, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { VERSION } from 'src/client/data/version'

// MARK: Main GameUI
export function VersionUI() {
	return (
		<UiEntity
			key={`ui_Version`}
			uiTransform={{
				width         : '100',
				height        : '40',
				positionType  : "absolute",
				position      : { bottom: 10, right: 10 },
			}}
			uiText={{
				value: VERSION,
				fontSize: 12,
				color: Color4.White(),
				textAlign: 'middle-center',
			}}
		/>
	)
}
