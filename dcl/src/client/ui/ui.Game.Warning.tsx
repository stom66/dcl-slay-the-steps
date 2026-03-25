import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, UiEntity } from '@dcl/sdk/react-ecs'
import { MessageType, room } from '../../room'


// Placeholders for dynamic content
let warningText  : string = ""
var visibleWarning       : boolean = false


export function ShowWarning(text: string) {
	visibleWarning = true
	warningText = text
}

export function HideWarning() {
	visibleWarning = false
	warningText = ""
}

// MARK: Main GameUI
export function WarningUI() {
	return (
		<UiEntity
			key={`ui_Warning_root`}
			uiTransform={{
				width         : '100%',
				height        : '100%',
				flexDirection : 'column',
				alignItems    : 'center',
				justifyContent: 'center',
				positionType  : "absolute",
			}}
		>
			<UiEntity
				key={`ui_Warning_body`}
				uiTransform={{
					width         : 420,
					height        : 'auto',
					flexDirection : 'column',
					alignItems    : 'center',
					justifyContent: 'flex-end',
					alignSelf     : 'center',
					flexShrink    : 1,
					margin        : { bottom               : '35px' },
					display       : visibleWarning ? 'flex': 'none',
					padding       : { top                  : 32, bottom: 32, left: 16, right: 16 },
					positionType  : "absolute",
					position      : { top: '45%' },
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-square-border.png"
					},
					textureMode: "nine-slices",
					textureSlices: {
						top   : 0.5,
						bottom: 0.5,
						left  : 0.5,
						right : 0.5
					}

				}}
			>
				<UiEntity
					key={`ui_Warning_close_icon`}
					uiTransform={{
						width         : 36,
						height        : 36,
						positionType  : "absolute",
						position      : { top: -8, right: -8 },
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
						key={`ui_Warning_close_button`}
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
						onMouseUp={() => HideWarning()}
					/>
				</UiEntity>

				<UiEntity
					key={`ui_Warning_header`}
					uiTransform={{
						width    : 280,
						height   : 48,
						margin   : { bottom: 26 },
						alignSelf: "center",
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/text-warning.png"
						},
						textureMode: "stretch",
					}}
				>
				</UiEntity>
				<Label
					key={`ui_Warning_text`}
					uiTransform={{
						width   : "100%",
						height  : "auto",
						margin  : { bottom: 16 },
						flexGrow: 1,
					}}
					value={warningText}
					fontSize={20}
				/>
				<Button
					key={`ui_Warning_close_button`}
					uiTransform={{
						width : 92,
						height: 36,
						margin: { top: 16 },
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/btn-ok.png"
						},
						textureMode: "center",
						color: Color4.White()
					}}
					value     = ""
					onMouseUp = {() => HideWarning()}
				/>
			</UiEntity>
		</UiEntity>
	)
}
