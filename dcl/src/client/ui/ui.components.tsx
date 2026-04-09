import ReactEcs, { Button, UiEntity} from '@dcl/sdk/react-ecs'
import { Color4 } from "@dcl/sdk/math"

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
				margin: 4
			}}
			value={textLabel}
			variant="primary"
			fontSize={14}
			onMouseDown={() => {
				callback!()
			}}
		/>
	)
}

export const InfoRow = ({ label, value }: { label: string; value: string }) => {
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
			width: 250,
			height: 'auto'
		}}
		uiText={{
			value: label,
			fontSize: 14,
			color: Color4.create(0.7, 0.7, 0.7, 1),
			textAlign: 'middle-left'
		}}
		/>
		<UiEntity
		uiTransform={{
			width: 300,
			height: 'auto'
		}}
		uiText={{
			value: value,
			fontSize: 14,
			color: Color4.White(),
			textAlign: 'middle-left'
		}}
		/>
		</UiEntity>
	)
}
