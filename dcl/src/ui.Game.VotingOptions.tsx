import ReactEcs, { Button, Label, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { MessageBus } from '@dcl/sdk/message-bus'
import { getPlayer } from '@dcl/sdk/players'

import { GetBackgroundTexture } from './utils'
import { _GameManager, localPlayer } from './GameManager'
import { MessageBusEvents } from './_settings'

const sceneMessageBus = new MessageBus()


// Placeholders for dynamic content
var visibleVoting: boolean = false
let votingOptions: any[]  = [];
let votedFor     : string = ""


export function ShowVotingOptions() {
	visibleVoting = true
	votingOptions = BuildVotingOptions()
}
export function HideVotingOptions() {
	visibleVoting = false
	votedFor      = ""
}

export function UpdateVotingOptions() {
	votingOptions = BuildVotingOptions()
}

function VoteForWinner(userId: string) {
	if (votedFor === userId) {
		votedFor = ""
	} else {
		votedFor = userId
	}

	console.log("VoteForWinner()",)
	UpdateVotingOptions()
	sceneMessageBus.emit(MessageBusEvents.NOTIFY_SERVER_VOTE, {
		voteFrom: localPlayer.userId,
		voteFor : userId
	})
}


// MARK: BuildVotingOptions
function BuildVotingOptions() {
	let elements: any[] = []

	// Defensive check: ensure _GameManager is initialized
	if (!_GameManager || !_GameManager.state) {
		return elements
	}

	const playerList = _GameManager.state.players

	//_GameManager.state.players.forEach((votingOption: string) => {
	playerList.forEach((userId: string) => {
		const playerData = getPlayer({ userId: userId })
		if (!playerData) {
			console.error("BuildVotingOptions: Failed to get player data for user", userId)
			return
		}

		const isEven            = elements.length % 2 === 0
		const backgroundTexture = GetBackgroundTexture(isEven)

		elements.push(
			<UiEntity
				key={`voting_option_${userId}`}
				uiTransform={{
					width        : "100%",
					height       : 48,
					flex         : 1,
					flexShrink   : 1,
					flexDirection: 'row',
					padding      : { left: 8, right: 6, top: 6, bottom: 6 },
					margin       : { bottom: 8 },
				}}
				uiBackground={{
					texture: {
						src: backgroundTexture
					},
					textureMode: "nine-slices",
					textureSlices: {
						top   : 0.25,
						bottom: 0.75,
						left  : 0.5,
						right : 0.5
					}

				}}
			>
				<UiEntity
					key={`voting_option_avatar_${userId}`}
					uiTransform={{
						width : 36,
						height: 36,
						margin: { right: 10 },
					}}
					uiBackground={{
						avatarTexture: { userId: userId },
						textureMode  : "stretch"
					}}
				/>
				<Label
					key={`voting_option_label_${userId}`}
					uiTransform={{
						height  : "100%",
						flexGrow: 1,
					}}
					fontSize  = {16}
					font      = 'sans-serif'
					color     = {Color4.White()}
					value     = {playerData.name}
					textWrap  = 'nowrap'
					textAlign = "middle-left"
				/>
				<Button
					key={`voting_option_button_${userId}`}
					uiTransform={{
						width  : 92,
						height : 36,
						display: userId !== localPlayer.userId ? 'flex' : 'none',
					}}
					value    = ""
					fontSize = {16}
					font     = 'sans-serif'
					color    = {Color4.Black()}
					variant  = 'secondary'
					uiBackground={{
						texture: {
							src: votedFor === userId ? "assets/images/ui/btn-voted.png" : "assets/images/ui/btn-vote.png"
						},
						textureMode: "stretch"
					}}
					onMouseUp={() => VoteForWinner(userId)}
				/>
			</UiEntity>
		)
	})
	console.log("BuildVotingOptions()", elements)
	return elements
}


// MARK: Main GameUI
export function VotingOptionsUI() {
	// This continues to build the voting options every frame the UI is visible, in an attempt 
	// to combat a bug with the AvatarTexture being incorrect. It does not work.
	//if (visibleVoting) {
	//	votingOptions = BuildVotingOptions()
	//}
	return (
		<UiEntity
			key={`ui_VotingOptions_root`}
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
				key={`ui_VotingOptions_body`}
				uiTransform={{
					width         : 420,
					height        : 'auto',
					flexDirection : 'column',
					alignItems    : 'center',
					justifyContent: 'space-evenly',
					alignSelf     : 'center',
					flexShrink    : 1,
					margin        : { bottom              : '35px', top: '-64px' },
					display       : visibleVoting ? 'flex': 'none',
					padding       : { top: 32, bottom: 32, left: 16, right: 16 },
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
					key={`ui_VotingOptions_close_icon`}
					uiTransform={{
						width         : 48,
						height        : 48,
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
						key={`ui_VotingOptions_close_button`}
						uiTransform={{
							width : "100%",
							height: "100%",
						}}
						uiBackground={{
							texture: {
								src: "assets/images/ui/icon-close.png"
							},
							textureMode: "center",
							color: Color4.fromHexString("#D89130")
						}}
						value=""
						onMouseUp={() => HideVotingOptions()}
					/>
				</UiEntity>
				<UiEntity
					key={`ui_VotingOptions_header`}
					uiTransform={{
						width    : 240,
						height   : 48,
						alignSelf: "center",
						margin   : { bottom: 16 },
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/text-voting.png"
						},
						textureMode: "stretch"
					}}
				/>

				{votingOptions}
			</UiEntity>
		</UiEntity>
	)
}
