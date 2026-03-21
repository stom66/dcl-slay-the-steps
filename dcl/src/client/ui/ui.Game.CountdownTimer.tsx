import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { GameManager } from '../GameManager'


// Placeholders for dynamic content
export var visibleCountdownTimer: boolean = false

export function ShowCountdownTimer() {
	visibleCountdownTimer = true
}
export function HideCountdownTimer() {
	visibleCountdownTimer = false
}


// MARK: Main GameUI
export function CountdownTimerUI() {
	return (
		<UiEntity
			key={`ui_CountdownTimer_root`}
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
				key={`ui_CountdownTimer_body`}
				uiTransform={{
					width         : 340,
					height        : 120,
					flexShrink    : 0,
					flexDirection : 'row',
					alignItems    : 'center',
					justifyContent: 'center',
					margin        : { top: '35px' },
					display       : visibleCountdownTimer ? 'flex' : 'none'
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-countdown.png"
					},
					textureMode: "stretch",

				}}
			>
				<UiEntity
					key={`ui_CountdownTimer_value`}
					uiTransform={{
						width : 128,
						height: 64,
						margin: { right: 0 },
					}}
					uiText={{
						value    : (GameManager?.countdownValue ?? 0).toString() == "0" ? "GO!" : (GameManager?.countdownValue ?? 0).toString(),
						fontSize : 64,
						textAlign: "middle-center",
						color    : Color4.White()
					}}
				/>
			</UiEntity>
		</UiEntity>
	)
}
