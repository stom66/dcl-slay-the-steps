import ReactEcs, { Button, Label, UiEntity } from '@dcl/sdk/react-ecs'
import { MessageBus } from '@dcl/sdk/message-bus'
import { getPlayer } from '@dcl/sdk/players';
import { Color4 } from '@dcl/sdk/math'

import { GameStatus } from 'src/shared/enums';
import { ClientState } from 'src/shared/types';
import { eventBus } from 'src/shared/utils/eventBus';
import { userProfileCache } from 'src/shared/utils/userProfileCache'

import { GetBackgroundTexture } from 'src/client/utils'
import { ClientEvents } from 'src/client/clientEvents';
import { ClientStore } from 'src/client/clientStore';


// MARK: Event Binding
eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
	if (data.serverStatus === GameStatus.GAME_ENDED) {
		ShowVotingResults()
	} else {
		HideVotingResults()
	}
})


// MARK: Vars
const clientStore = ClientStore.getInstance()
var visibleVotingResults : boolean = false
let votingResults: ReactEcs.JSX.Element[] = []


// MARK: Utility functions
function ShowVotingResults() {
	visibleVotingResults = true
	UpdateVotingResults()
}
function HideVotingResults() {
	visibleVotingResults = false
}


// MARK: BuildVotingResults
function GetVotingResults() {

	const elements: ReactEcs.JSX.Element[] = [] // array of UIElements for each player
	const results : Record<string, number> = {} // dictionary of vote results
	
	console.log("ui.Game.VotingResults: BuildVotingResults(), votes.length:", clientStore.getVoteResults().size.toString())

	// Build the results, getting the count of votes for each player
	Object.entries(clientStore.getVoteResults()).forEach(([userId, votedFor]) => {
		if (results[votedFor] === undefined) {
			results[votedFor] = 1
		} else {
			results[votedFor]++
		}
	})

	// To sort voting results, we need an array, not an object. Let's get an array of [userId, count] and sort it.
	const sortedResults = Object.entries(results).sort((a, b) => b[1] - a[1])

	// If there are no votes, show a message
	if (sortedResults.length === 0) {
		elements.push(
			<UiEntity
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
						src: "assets/images/ui/bg-default.png"
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
				<Label
					uiTransform={{
						height: "100%",
						width : "100%",
					}}
					fontSize  = {16}
					font      = 'sans-serif'
					color     = {Color4.White()}
					value     = "There are no votes to show"
					textWrap  = 'nowrap'
					textAlign = "middle-center"
				/>

			</UiEntity>
		)
		return elements
	}

	// Build the "row" elements
	sortedResults.forEach(([userId, score]: [string, number]) => {
		const playerData = getPlayer({ userId: userId })
		if (!playerData) {
			console.error("ui.Game.VotingResults: BuildVotingResults: Failed to get player data for user", userId)
			return
		}

		const isEven            = elements.length % 2 === 0
		const backgroundTexture = GetBackgroundTexture(isEven)

		const avatarTexture = userProfileCache.getCachedAvatarUrl(userId)
		if (!avatarTexture) {
			userProfileCache.whenAvatarUrlAvailable(userId, UpdateVotingResults)
		}

		elements.push(
			<UiEntity
				key={`voting_result_${userId}`}
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
					key={`voting_result_${userId}_avatar`}
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
					key={`voting_result_${userId}_name`}
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
				<UiEntity
					key={`voting_result_${userId}_iconStar`}
					uiTransform={{
						width  : 36,
						height : 36,
						margin : { right: 10 },
						display: elements.length === 0 ? 'flex' : 'none',
					}}
					uiBackground={{
						texture    : { src: "assets/images/ui/icon-star.png" },
						textureMode: "stretch"
					}}
				/>
				<Label
					key={`voting_result_${userId}_score`}
					uiTransform={{
						height: "100%",
						margin: { right: 16 },
					}}
					fontSize  = {16}
					font      = 'sans-serif'
					color     = {Color4.White()}
					value     = {score.toString()}
					textAlign = "middle-center"

				/>
			</UiEntity>
		)
	})
	return elements
}

function UpdateVotingResults() {
	votingResults = GetVotingResults()
}

UpdateVotingResults()


// MARK: Main VotingResultsUI
export function VotingResultsUI() {
	return (
		<UiEntity
			key={`ui_votingResults_root`}
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
				key={`ui_VotingResults_body`}
				uiTransform={{
					width         : 420,
					height        : 'auto',
					flexDirection : 'column',
					alignItems    : 'center',
					justifyContent: 'space-evenly',
					alignSelf     : 'center',
					flexShrink    : 1,
					margin        : { bottom: '35px' },
					display       : visibleVotingResults ? 'flex': 'none',
					padding       : { top: 16, bottom: 32, left: 16, right: 16 },
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
					key={`ui_VotingResults_close_icon`}
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
						key={`ui_VotingResults_close_button`}
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
						onMouseUp={() => HideVotingResults()}
					/>
				</UiEntity>
				<UiEntity
					key={`ui_VotingResults_header`}
					uiTransform={{
						width    : 240,
						height   : 48,
						alignSelf: "center",
						margin   : { bottom: 16 },
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/text-vote-results.png"
						},
						textureMode: "stretch"
					}}
				/>

				{votingResults}
			</UiEntity>
		</UiEntity>
	)
}
