import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'


import { _GameManager } from './GameManager'
import { GameSettings } from './_settings'


// Placeholders for dynamic content
export var visibleYouAreNext: boolean = false

export function ShowYouAreNext() {
	console.log("ShowYouAreNext()")
	visibleYouAreNext = true
	utils.timers.setTimeout(() => {
		HideYouAreNext()
	}, GameSettings.YOU_ARE_NEXT_PREEMPT_TIME * 1000)
}

export function HideYouAreNext() {
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
					width         : 374,
					height        : 132,
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
