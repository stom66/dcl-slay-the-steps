import ReactEcs, { Button, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'


import { GameManager } from './GameManager'
import { GameSettings } from './_settings'


// Placeholders for dynamic content
export var visibleEmotesHint: boolean = false

export function ShowEmotesHint() {
	console.log("ui.Game.Emotes: ShowEmotesHint()")
	visibleEmotesHint = true
	utils.timers.setTimeout(() => {
		HideEmotesHint()
	}, GameSettings.ROUND_DURATION_PER_PLAYER * 1000)
}

export function HideEmotesHint() {
	visibleEmotesHint = false
}


// MARK: Main GameUI
export function EmotesHintUI() {
	return (
		<UiEntity
			key={`ui_EmotesHint_root`}
			uiTransform={{
				width         : '100%',
				height        : '100%',
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: 'flex-end',
				positionType  : "absolute",
			}}
		>
			<UiEntity
				key={`ui_EmotesHint_body`}
				uiTransform={{
					width         : 340,
					height        : 200,
					flexShrink    : 0,
					flexDirection : 'row',
					alignItems    : 'center',
					justifyContent: 'center',
					margin        : { bottom: '80px' },
					display       : visibleEmotesHint ? 'flex' : 'none'
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-emotes.png"
					},
					textureMode: "stretch",

				}}
			>
				<UiEntity
					key={`ui_EmotesHint_close_icon`}
					uiTransform={{
						width         : 48,
						height        : 48,
						positionType  : "absolute",
						position      : { top: -12, right: -12 },
						display       : "flex",
						alignItems    : "center",
						justifyContent: "center",
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/icon-circle.png"
						},
						textureMode: "stretch"
					}}
				>
					<Button
						key={`ui_EmotesHint_close_button`}
						uiTransform={{
							width : "100%",
							height: "100%",
						}}
						uiBackground={{
							texture: {
								src: "assets/images/ui/icon-close.png"
							},
							textureMode: "stretch",
							color: Color4.fromHexString("#D89130")
						}}
						value=""
						onMouseUp={() => HideEmotesHint()}
					/>
				</UiEntity>
			</UiEntity>
		</UiEntity>
	)
}
