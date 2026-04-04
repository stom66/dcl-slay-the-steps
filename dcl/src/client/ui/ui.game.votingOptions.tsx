import ReactEcs, { Button, Label, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { userProfileCache } from 'src/shared/utils/userProfileCache'
import { GetBackgroundTexture } from '../utils'
import { ClientMessaging } from '../clientMessaging'
import { ClientStore } from '../clientStore'
import { eventBus } from 'src/shared/utils/eventBus'
import { ClientEvents } from '../clientEvents'
import { ClientState } from 'src/shared/types'
import { GameStatus } from 'src/shared/enums'


const clientStore = ClientStore.getInstance()


// Placeholders for dynamic content
var visibleVoting: boolean = false // toggles root element visibility
let votedFor     : string  = ""    // userId of the currently active player to show the star icon during a round
let votingOptions: ReactEcs.JSX.Element[] = []


// Utility functions
export function ShowVotingOptions() {
	visibleVoting = true
	UpdateVotingOptions()
}
export function HideVotingOptions() {
	visibleVoting = false
	votedFor      = ""
}

eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
	if (data.serverStatus === GameStatus.VOTING) {
		ShowVotingOptions()
	} else {
		HideVotingOptions()
	}
})

// Button function which triggers the actual vote
function VoteForWinner(userId: string) {
	// Allow player to remove their existing vote without voting for someone else
	if (votedFor === userId) {
		votedFor = ""
		ClientMessaging.RequestRemoveVote(userId)
	} else {
		
		ClientMessaging.RequestAddVote(userId)
		votedFor = userId
	}

	console.log("ui.Game.VotingOptions: VoteForWinner(): userId", userId)
	UpdateVotingOptions()
}

// MARK: BuildVotingOptions
function GetVotingOptions() {

	// Debugging incorrect AvatarTextures showing up
	const playersMap = clientStore.getPlayers()
	
	let elements: ReactEcs.JSX.Element[] = []

	// Build the "row" elements
	playersMap.forEach((displayName: string, userId: string) => {

		const isEven            = elements.length % 2 === 0
		const backgroundTexture = GetBackgroundTexture(isEven)

		const avatarTexture = userProfileCache.getCachedAvatarUrl(userId)
		if (!avatarTexture) {
			userProfileCache.whenAvatarUrlAvailable(userId, UpdateVotingOptions)
		}

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
						texture: { src: avatarTexture },
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
					value     = {displayName}
					textWrap  = 'nowrap'
					textAlign = "middle-left"
				/>
				<Button
					key={`voting_option_button_${userId}`}
					uiTransform={{
						width  : 92,
						height : 36,
						display: userId !== clientStore.getUserId() ? 'flex' : 'none',
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
	console.log("ui.Game.VotingOptions: BuildVotingOptions()", elements.length, "elements")
	return elements
}

function UpdateVotingOptions() {
	votingOptions = GetVotingOptions()
}

UpdateVotingOptions()


// MARK: Main VotingOptionsUI
export function VotingOptionsUI() {
	// DISABLED: Constantly refresh the voting options every frame
	// An effort to combat a bug with the AvatarTexture being incorrect. It does not work.

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
							color      : Color4.fromHexString("#D89130")
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
