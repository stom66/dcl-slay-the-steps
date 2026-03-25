import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Label, UiEntity } from '@dcl/sdk/react-ecs'


// Placeholders for dynamic content
var visibleHowToPlay: boolean = false


export function ShowHowToPlay() {
	visibleHowToPlay = true
}

export function HideHowToPlay() {
	visibleHowToPlay = false
}

// MARK: Main GameUI
export function HowToPlayUI() {
	return (
		<UiEntity
			key={`ui_HowToPlay_root`}
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
				key={`ui_HowToPlay_body`}
				uiTransform={{
					width         : 512,
					height        : 340,
					flexDirection : 'column',
					alignItems    : 'center',
					justifyContent: 'flex-end',
					flexShrink    : 1,
					margin        : { bottom: '35px' },
					display       : visibleHowToPlay ? 'flex': 'none',
					padding       : { top: 32, bottom: 32, left: 16, right: 16 },
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-howtoplay.png"
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
					key={`ui_HowToPlay_close_icon`}
					uiTransform={{
						width         : 56,
						height        : 56,
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
						key={`ui_HowToPlay_close_button`}
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
						onMouseUp={() => HideHowToPlay()}
					/>
				</UiEntity>
			</UiEntity>
		</UiEntity>
	)
}
