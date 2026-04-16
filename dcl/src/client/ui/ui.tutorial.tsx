import { engine } from '@dcl/sdk/ecs'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { tweenValue } from './utils'
import { Tutorial } from '../tutorial'


// MARK: State
var panelVisible = false
var arrowVisible = false
var currentInfo = "thisIsYourMannequin"

// MARK: Panel positioning
const PANEL_BOTTOM_HIDDEN = -150
const PANEL_BOTTOM_VISIBLE = 64
var panelBottom = PANEL_BOTTOM_HIDDEN

// MARK: Arrow positioning
const ARROW_OFF_SCREEN = 1440
const ARROW_TARGET_TOP = 180
const ARROW_BOUNCE_RANGE = 20
var arrowTop = ARROW_OFF_SCREEN
var arrowElapsed = 0

var btnVisible = true
var btnHoverVisible = false


function arrowBounce(dt: number) {
	arrowElapsed += dt
	arrowTop = ARROW_TARGET_TOP + Math.sin(arrowElapsed * 4) * ARROW_BOUNCE_RANGE
}


// MARK: Public API

export function SetTutorialInfo(info: string) {
	if (panelVisible) {
		tweenValue(panelBottom, PANEL_BOTTOM_HIDDEN, 0.2,
			(v) => panelBottom = v,
			() => {
				currentInfo = info
				tweenValue(PANEL_BOTTOM_HIDDEN, PANEL_BOTTOM_VISIBLE, 0.2, (v) => panelBottom = v)
			}
		)
	} else {
		currentInfo = info
	}
}

export function ShowTutorial() {
	panelVisible = true
	tweenValue(panelBottom, PANEL_BOTTOM_VISIBLE, 0.2, (v) => panelBottom = v)
}

export function HideTutorial() {
	tweenValue(panelBottom, PANEL_BOTTOM_HIDDEN, 0.2,
		(v) => panelBottom = v,
		() => { panelVisible = false }
	)
}

export function HideTutorialBtn() {
	btnVisible = false
}

export function ShowArrow() {
	arrowVisible = true
	arrowElapsed = 0
	tweenValue(ARROW_OFF_SCREEN, ARROW_TARGET_TOP, 0.4,
		(v) => arrowTop = v,
		() => engine.addSystem(arrowBounce)
	)
}

export function HideArrow() {
	engine.removeSystem(arrowBounce)
	tweenValue(arrowTop, ARROW_OFF_SCREEN, 0.4,
		(v) => arrowTop = v,
		() => { arrowVisible = false }
	)
}


// MARK: Component
export function TutorialUI() {
	return (
		<UiEntity
			key="ui_Tutorial_root"
			uiTransform={{
				width         : '100%',
				height        : '100%',
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: 'flex-start',
				positionType  : 'absolute',
			}}
		>
			<UiEntity
				key="ui_Tutorial_Info"
				uiTransform={{
					width       : 420,
					height      : 120,
					flexShrink  : 0,
					display     : panelVisible ? 'flex' : 'none',
					positionType: 'absolute',
					position    : { bottom: panelBottom },
				}}
				uiBackground={{
					texture: { src: `assets/images/ui/tutorial-${currentInfo}.png` },
				}}
			/>
			<UiEntity
				key="ui_Tutorial_Arrow"
				uiTransform={{
					width       : 192,
					height      : 384,
					flexShrink  : 0,
					display     : arrowVisible ? 'flex' : 'none',
					positionType: 'absolute',
					position    : { top: arrowTop },
				}}
				uiBackground={{
					texture    : { src: 'assets/images/ui/big-arrow.png' },
					textureMode: 'stretch',
				}}
			/>


			<UiEntity
				key="ui_Tutorial_Btn"
				uiTransform={{
					width       : 180,
					height      : 56,
					flexShrink  : 0,
					display     : btnVisible ? 'flex' : 'none',
					positionType: 'absolute',
					position    : { bottom: 4 },
				}}
				uiBackground={{
					texture    : { src: 'assets/images/ui/btn-skip-tutorial.png' },
					textureMode: 'stretch',
				}}
				onMouseEnter={() => { btnHoverVisible = true }}
				onMouseLeave={() => { btnHoverVisible = false }}
				onMouseDown={() => { 
					Tutorial.QuitTutorial()
				 }}
			>
				<UiEntity
					key="ui_Tutorial_Btn"
					uiTransform={{
						width       : 180,
						height      : 56,
						flexShrink  : 0,
						display     : btnHoverVisible ? 'flex' : 'none',
					}}
					uiBackground={{
						texture    : { src: 'assets/images/ui/btn-skip-tutorial-hover.png' },
						textureMode: 'stretch',
					}}
				/>
			</UiEntity>
		</UiEntity>
	)
}
