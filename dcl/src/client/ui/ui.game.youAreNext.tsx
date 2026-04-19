import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import * as utils from '@dcl-sdk/utils'

import { GameSettings } from 'src/shared/settings'
import { eventBus } from 'src/shared/utils/eventBus'

import { sfx } from 'src/client/data/sfx'
import { ClientEvents } from 'src/client/clientEvents'
import { SoundManager } from 'src/client/soundManager'
import { tweenValue } from './ui-utils'
import { NotifyTurnStartingPayload } from 'src/shared/types'
import { ClientStore } from '../clientStore'


// MARK: Event Binding
eventBus.on(ClientEvents.NOTIFY_TURN_STARTING_SOON, () => {
	ShowYouAreNext()
	SoundManager.PlaySound(sfx.turnStartsSoon)
})
eventBus.on(ClientEvents.NOTIFY_TURN_STARTING, (data: NotifyTurnStartingPayload) => {
	if (clientStore.isMyTurn()) {
		HideYouAreNext()
	}
})


// MARK: Vars
const clientStore = ClientStore.getInstance()
var visibleYouAreNext: boolean = false

const PANEL_BOTTOM_HIDDEN  = -200
const PANEL_BOTTOM_VISIBLE = 80
var panelBottom            : number = PANEL_BOTTOM_HIDDEN

// MARK: Utility functions
function ShowYouAreNext(ignoreInterval: boolean = false) {
	console.log("ui.Game.YouAreNext: ShowYouAreNext()")
	visibleYouAreNext = true
	tweenValue(panelBottom, PANEL_BOTTOM_VISIBLE, 0.2, (v) => panelBottom = v)

	let timeout = ignoreInterval ? GameSettings.YOU_ARE_NEXT_PREEMPT_TIME : GameSettings.YOU_ARE_NEXT_PREEMPT_TIME + GameSettings.ROUND_INTERVAL
	utils.timers.setTimeout(() => {
		HideYouAreNext()
	}, timeout)
}

function HideYouAreNext() {
	tweenValue(panelBottom, PANEL_BOTTOM_HIDDEN, 0.2, (v) => panelBottom = v)
	utils.timers.setTimeout(() => {
		visibleYouAreNext = false
	}, 0.5 * 1000)
}


// MARK: Main GameUI
export function YouAreNextUI() {
	return (
		<UiEntity
			key={`ui_YouAreNext_root`}
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
				key={`ui_YouAreNext_body`}
				uiTransform={{
					width         : 512,
					height        : 180,
					flexShrink    : 0,
					flexDirection : 'row',
					alignItems    : 'center',
					justifyContent: 'center',
					display       : visibleYouAreNext ? 'flex' : 'none',
					positionType  : "absolute",
					position      : { bottom: panelBottom },
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-youarenext.png"
					},
					textureMode: "stretch",

				}}
			>
			</UiEntity>
		</UiEntity>
	)
}
