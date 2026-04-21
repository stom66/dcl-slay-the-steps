import { EasingFunction, engine } from '@dcl/sdk/ecs'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { tweenValue } from './ui-utils'
import { Tutorial } from '../tutorial'


// MARK: State
var currentInfo             = "thisIsYourMannequin"
var panelVisible            = false
var upArrowVisible          = false
var downArrowVisible        = false
var downArrowXOffset        = 0
var arrowElapsed            = 0

// MARK                     : Panel positioning
const PANEL_BOTTOM_HIDDEN   = -150
const PANEL_BOTTOM_VISIBLE  = 92
const PANEL_BOTTOM_RAISED   = 320
var infoPanelBottom         = PANEL_BOTTOM_HIDDEN

// MARK                     : Arrow positioning
const ARROW_BOUNCE_RANGE    = 20

const DOWN_ARROW_OFF_SCREEN = 1440
const DOWN_ARROW_ON_SCREEN  = 86
var downArrowPosBottom      = DOWN_ARROW_OFF_SCREEN

const UP_ARROW_OFF_SCREEN   = 1440
const UP_ARROW_ON_SCREEN    = 196
var upArrowPosTop           = UP_ARROW_OFF_SCREEN


var btnVisible              = true
var btnHoverVisible         = false


function upArrowBounce(dt: number) {
	arrowElapsed += dt
	upArrowPosTop = UP_ARROW_ON_SCREEN + Math.sin(arrowElapsed * 4) * ARROW_BOUNCE_RANGE
}

function downArrowBounce(dt: number) {
	arrowElapsed += dt
	downArrowPosBottom = DOWN_ARROW_ON_SCREEN + Math.sin(arrowElapsed * 4) * ARROW_BOUNCE_RANGE /2
}


// MARK: Public API

export function SetTutorialInfo(info: string, showHigher: boolean = false) {
	if (panelVisible) {
		tweenValue(infoPanelBottom, PANEL_BOTTOM_HIDDEN, 0.2,
			(v) => infoPanelBottom = v,
			() => {
				currentInfo = info
				tweenValue(PANEL_BOTTOM_HIDDEN, showHigher ? PANEL_BOTTOM_RAISED : PANEL_BOTTOM_VISIBLE, undefined, (v) => infoPanelBottom = v)
			}
		)
	} else {
		panelVisible = true
		currentInfo = info
		tweenValue(PANEL_BOTTOM_HIDDEN, showHigher ? PANEL_BOTTOM_RAISED : PANEL_BOTTOM_VISIBLE, undefined, (v) => infoPanelBottom = v)
	}
}


// MARK: Show/Hide
export function ShowTutorial() {
	panelVisible = true
	btnVisible = true
	btnHoverVisible = false
	tweenValue(infoPanelBottom, PANEL_BOTTOM_VISIBLE, undefined, (v) => infoPanelBottom = v)
}

export function HideTutorial() {
	tweenValue(infoPanelBottom, PANEL_BOTTOM_HIDDEN, 0.2,
		(v) => infoPanelBottom = v,
		() => { panelVisible = false }
	)
}

export function HideTutorialBtn() {
	btnVisible = false
}


// MARK: Up Arrow
export function ShowUpArrow() {
	upArrowVisible = true
	arrowElapsed = 0
	tweenValue(UP_ARROW_OFF_SCREEN, UP_ARROW_ON_SCREEN, 1,
		(v) => upArrowPosTop = v,
		() => engine.addSystem(upArrowBounce),
		EasingFunction.EF_EASEOUTBOUNCE
	)
}

export function HideUpArrow() {
	engine.removeSystem(upArrowBounce)
	tweenValue(upArrowPosTop, UP_ARROW_OFF_SCREEN, 0.4,
		(v) => upArrowPosTop = v,
		() => { upArrowVisible = false }
	)
}



// MARK: Down Arrow
export function ShowDownArrow(xOffset: number = 0) {
	downArrowVisible = true
	downArrowXOffset = xOffset
	arrowElapsed = 0
	tweenValue(DOWN_ARROW_OFF_SCREEN, DOWN_ARROW_ON_SCREEN, 1,
		(v) => downArrowPosBottom = v,
		() => {
			arrowElapsed = 0
			engine.addSystem(downArrowBounce)
		},
		EasingFunction.EF_EASEOUTBOUNCE
	)
}

export function HideDownArrow() {
	engine.removeSystem(downArrowBounce)
	tweenValue(downArrowPosBottom, DOWN_ARROW_OFF_SCREEN, 0.4,
		(v) => downArrowPosBottom = v,
		() => { 
			downArrowVisible = false; 
		}
	)
}

export function BounceDownArrow(xOffset: number) {
	const startX = downArrowXOffset
	const dx = xOffset - startX
	const hdx = dx / 2

	engine.removeSystem(downArrowBounce)

	// Tween the X
	tweenValue(startX, xOffset, 0.6,
		(v) => downArrowXOffset = v,
		() => {},
		EasingFunction.EF_EASESINE
	)

	// Tween the Y
	tweenValue(DOWN_ARROW_ON_SCREEN, DOWN_ARROW_ON_SCREEN+48, 0.3,
		(v) => downArrowPosBottom = v,
		() => {
			tweenValue(DOWN_ARROW_ON_SCREEN+48, DOWN_ARROW_ON_SCREEN, 0.3,
				(v) => downArrowPosBottom = v,
				() => {
					arrowElapsed = 0
					engine.addSystem(downArrowBounce)
				},
				EasingFunction.EF_EASEINCIRC
			)
		},
		EasingFunction.EF_EASEOUTCIRC
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
				justifyContent: 'flex-end',
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
					position    : { bottom: infoPanelBottom },
				}}
				uiBackground={{
					texture: { src: `assets/images/ui/tutorial-${currentInfo}.png` },
				}}
			/>
			<UiEntity
				key="ui_Tutorial_Arrow_Up"
				uiTransform={{
					width       : 192,
					height      : 384,
					flexShrink  : 0,
					display     : upArrowVisible ? 'flex' : 'none',
					positionType: 'absolute',
					position    : { top: upArrowPosTop },
				}}
				uiBackground={{
					texture    : { src: 'assets/images/ui/big-arrow-up.png' },
					textureMode: 'stretch',
				}}
			/>

			<UiEntity
				key="ui_Tutorial_Arrow_Down"
				uiTransform={{
					width       : 110,
					height      : 220,
					flexShrink  : 0,
					display     : downArrowVisible ? 'flex' : 'none',
					positionType: 'relative',
					position    : { bottom: downArrowPosBottom, left: downArrowXOffset },
				}}
				uiBackground={{
					texture    : { src: 'assets/images/ui/big-arrow-down.png' },
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
					position    : { bottom: 4, right: 384 },
					margin      : { left: 320, right: 0 },
				}}
				uiBackground={{
					texture    : { src: 'assets/images/ui/btn-skip-tutorial.png' },
					textureMode: 'stretch',
				}}
				onMouseEnter={() => { btnHoverVisible = true }}
				onMouseLeave={() => { btnHoverVisible = false }}
				onMouseDown={() => { 
					Tutorial.AbortTutorial()
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
