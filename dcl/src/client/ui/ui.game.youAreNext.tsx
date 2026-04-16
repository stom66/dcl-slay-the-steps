import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import * as utils from '@dcl-sdk/utils'

import { GameSettings } from 'src/shared/settings'
import { eventBus } from 'src/shared/utils/eventBus'

import { sfx } from 'src/client/data/sfx'
import { ClientEvents } from 'src/client/clientEvents'
import { SoundManager } from 'src/client/soundManager'


// MARK: Event Binding
eventBus.on(ClientEvents.NOTIFY_TURN_STARTING_SOON, () => {
	ShowYouAreNext()
	SoundManager.PlaySound(sfx.turnStartsSoon)
})


// MARK: Vars
var visibleYouAreNext: boolean = false


// MARK: Utility functions
function ShowYouAreNext(ignoreInterval: boolean = false) {
	console.log("ui.Game.YouAreNext: ShowYouAreNext()")
	visibleYouAreNext = true

	let timeout = ignoreInterval ? GameSettings.YOU_ARE_NEXT_PREEMPT_TIME : GameSettings.YOU_ARE_NEXT_PREEMPT_TIME + GameSettings.ROUND_INTERVAL
	utils.timers.setTimeout(() => {
		HideYouAreNext()
	}, timeout)
}

function HideYouAreNext() {
	visibleYouAreNext = false
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
					margin        : { bottom: '80px' },
					display       : visibleYouAreNext ? 'flex' : 'none'
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
