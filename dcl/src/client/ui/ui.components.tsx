import ReactEcs, { Button, PositionUnit, UiEntity} from '@dcl/sdk/react-ecs'
import { Color4 } from "@dcl/sdk/math"
import { GameStatus } from 'src/shared/enums'

export const SectionHeader = ({ title }: { title: string }) => {
	return (
		<UiEntity
		uiTransform={{
			width: '100%',
			height: 'auto',
			padding: { top: 10, bottom: 5 }
		}}
		uiText={{
			value: title,
			fontSize: 20,
			color: Color4.create(1, 0.8, 0.3, 1),
			textAlign: 'middle-left'
		}}
		/>
	)
}

export const Divider = () => {
	return (
		<UiEntity
		uiTransform={{
			width: '100%',
			height: 2,
			margin: { top: 10, bottom: 10 }
		}}
		uiBackground={{
			color: Color4.create(0.3, 0.3, 0.3, 1)
		}}
		/>
	)
}

export const ButtonAction = ({ textLabel, callback }: { textLabel: string; callback: () => void | undefined }) => {
	return (
		<Button
			uiTransform={{
				width: "100%",
				height: 40,
				margin: 3,
				borderRadius: 6,
				borderColor: Color4.fromHexString("#508894"),
				borderWidth: 2
			}}
			value={textLabel}
			fontSize={14}
			onMouseDown={() => {
				callback!()
			}}
			uiBackground={{ color: Color4.fromHexString("#44727b") }}
		/>
	)
}

const hoverStates: Map<string, boolean> = new Map()

export const ButtonImage = (
	{ 
		width,
		height,
		imageSrc,
		callback,
	}: { 
		width   : string;
		height  : string;
		imageSrc: string; 
		callback: () => void | undefined 
	}
) => {
	return (
		<UiEntity
			uiTransform={{
				width       : `${width as PositionUnit}`,
				height      : `${height as PositionUnit}`,
				display     : "flex",
				margin      : { left: 3, right: 3 },
			}}
			uiBackground={{
				texture: {
					src: `assets/images/ui/${imageSrc}.png`
				},
				textureMode: "stretch",
			}}
			onMouseDown={() => {
				callback!()
			}}
			onMouseEnter={() => {
				hoverStates.set(imageSrc, true)
			}}
			onMouseLeave={() => {
				hoverStates.set(imageSrc, false)
			}}
		>
			<UiEntity
				uiTransform={{
					width : "100%",
					height: "100%",
					display: hoverStates.get(imageSrc) ? 'flex' : 'none',
				}}
				uiBackground={{
					texture: {
						src: `assets/images/ui/${imageSrc}-hover.png`
					},
					textureMode: "stretch",
				}}
			/>
		</UiEntity>
	)
}

export const InfoRow = ({ label, value, fontSize, firstColumnWidth }: { label: string; value: string, fontSize?: number, firstColumnWidth?: number }) => {
	return (
		<UiEntity
		uiTransform={{
			width: '100%',
			height: 'auto',
			padding: { top: 5, bottom: 5 },
			flexDirection: 'row'
		}}
		>
		<UiEntity
		uiTransform={{
			width: firstColumnWidth !== undefined ? `${firstColumnWidth}%` : "50%",
			height: 'auto'
		}}
		uiText={{
			value: label,
			fontSize: fontSize ?? 13,
			color: Color4.fromHexString("#64abba"),
			textAlign: 'middle-left'
		}}
		/>
		<UiEntity
		uiTransform={{
			width: firstColumnWidth !== undefined ? `${100 - firstColumnWidth}%` : "50%",
			height: 'auto'
		}}
		uiText={{
			value: value,
			fontSize: fontSize ?? 13,
			color: Color4.White(),
			textAlign: 'middle-left'
		}}
		/>
		</UiEntity>
	)
}
