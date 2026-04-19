import ReactEcs, { Button, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'

import { ClientState, NotifyTurnStartingPayload } from 'src/shared/types'
import { eventBus } from 'src/shared/utils/eventBus'

import { ClientEvents } from 'src/client/clientEvents'
import { ClientStore } from 'src/client/clientStore'
import { tweenValue } from './ui-utils'


// MARK: Event Bindings
eventBus.on(ClientEvents.NOTIFY_TURN_STARTING, (data: NotifyTurnStartingPayload) => {
	if (clientStore.isMyTurn()) {
		ShowEmotesHint()
	} else {
		HideEmotesHint()
	}
})

eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
	HideEmotesHint()
})


// MARK: Vars

const clientStore = ClientStore.getInstance()

var visibleEmotesHint      : boolean = false

const PANEL_BOTTOM_HIDDEN  = -250
const PANEL_BOTTOM_VISIBLE = 50
var panelBottom            : number  = PANEL_BOTTOM_HIDDEN


export function ShowEmotesHint() {
	console.log("ui.Game.Emotes: ShowEmotesHint()")
	visibleEmotesHint = true
	tweenValue(panelBottom, PANEL_BOTTOM_VISIBLE, 0.3, (v) => panelBottom = v)
}

export function HideEmotesHint() {
	tweenValue(panelBottom, PANEL_BOTTOM_HIDDEN, 0.3, (v) => panelBottom = v)
	utils.timers.setTimeout(() => {
		visibleEmotesHint = false
	}, 0.5 * 1000)
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
					width         : 400,
					height        : 225,
					flexShrink    : 0,
					flexDirection : 'row',
					alignItems    : 'center',
					justifyContent: 'center',
					positionType  : "absolute",
					position      : { bottom: panelBottom },
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
