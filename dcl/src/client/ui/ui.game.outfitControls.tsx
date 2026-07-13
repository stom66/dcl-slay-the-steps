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
import { Color3, Color4 } from '@dcl/sdk/math'
import { OutfitManager } from '../outfitManager'
import { ButtonImage } from './ui.components'


// MARK: Event Binding
eventBus.on(ClientEvents.TUTORIAL_ABORT,     ShowOutfitControls)
eventBus.on(ClientEvents.TUTORIAL_COMPLETED, ShowOutfitControls)


eventBus.on(ClientEvents.TUTORIAL_STARTED,  HideOutfitControls)
eventBus.on(ClientEvents.JOIN_AS_PLAYER,    HideOutfitControls)
eventBus.on(ClientEvents.JOIN_AS_SPECTATOR, HideOutfitControls)

eventBus.on(ClientEvents.GAME_STARTED, (data: NotifyTurnStartingPayload) => {
	if (clientStore.isEnrolledInGame() || clientStore.isSpectatorInGame()) HideOutfitControls()
})

eventBus.on(ClientEvents.GAME_ENDED, (data: NotifyTurnStartingPayload) => {
	if (clientStore.isEnrolledInGame() || clientStore.isSpectatorInGame()) ShowOutfitControls()
})


// MARK: Vars
const clientStore = ClientStore.getInstance()

const PANEL_BOTTOM_HIDDEN  = -200
const PANEL_BOTTOM_VISIBLE = 20
var panelBottom            : number  = PANEL_BOTTOM_HIDDEN
var isVisible              : boolean = false


// MARK: Utility functions
export function ShowOutfitControls() {
	console.log("ui.game.outfitControls: ShowOutfitControls()")
	isVisible = true
	tweenValue(panelBottom, PANEL_BOTTOM_VISIBLE, 0.2, (v) => panelBottom = v)
}

function HideOutfitControls() {
	console.log("ui.game.outfitControls: HideOutfitControls()")
	tweenValue(panelBottom, PANEL_BOTTOM_HIDDEN, 0.2, (v) => panelBottom = v, () => {
		isVisible = false
	})
}


// MARK: Main GameUI
export function OutfitControlsUI() {
	return (
		<UiEntity
			key={`ui_OutfitControls_root`}
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
				key={`ui_OutfitControls_body`}
				uiTransform={{
					width         : 800,
					height        : 56,
					flexShrink    : 0,
					flexDirection : 'row',
					alignItems    : 'center',
					justifyContent: 'center',
					display       : isVisible ? 'flex' : 'none',
					positionType  : "absolute",
					position      : { bottom: panelBottom },
				}}
			>
				<ButtonImage
					width    = '180'
					height   = '56'
					imageSrc = "btn-reset"
					callback = {() => { OutfitManager.RemoveOutfit(); SoundManager.playSound(sfx.buttons) }}
				/>
				<ButtonImage
					width    = '180'
					height   = '56'
					imageSrc = "btn-swap"
					callback = {() => { OutfitManager.SwapGender(); SoundManager.playSound(sfx.buttons) }}
				/>
				<ButtonImage
					width    = '180'
					height   = '56'
					imageSrc = "btn-copy"
					callback = {() => { OutfitManager.CopyMyOutfit(); SoundManager.playSound(sfx.buttons) }}
				/>
			</UiEntity>
		</UiEntity>
	)
}
