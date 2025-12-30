import ReactEcs, { Button, Label, UiEntity } from '@dcl/sdk/react-ecs'
import { MessageBus } from '@dcl/sdk/message-bus'
import { getPlayer } from '@dcl/sdk/players';
import { Color4 } from '@dcl/sdk/math'

import { GetBackgroundTexture } from './utils';
import { _GameManager } from './GameManager';
import { HideVotingOptions } from './ui.Game.VotingOptions';


// Placeholders for dynamic content
let votingResults: any[]  = [];
var visibleVotingResults : boolean = false

export function ShowVotingResults() {
	HideVotingOptions()
	UpdateVotingResults()
	visibleVotingResults = true
}
export function HideVotingResults() {
	visibleVotingResults = false
}

export function UpdateVotingResults() {
	votingResults = BuildVotingResults()
}


// MARK: BuildVotingResults
function BuildVotingResults() {
	let elements: any[] = []
	const results: Record<string, number> = {}

	// Defensive check: ensure _GameManager is initialized
	if (!_GameManager || !_GameManager.state) {
		return elements
	}

	//const votes = fakeVoteData // DEBUG DATA
	const votes = _GameManager.state.votes
	console.log("ui.Game.VotingResults: BuildVotingResults(), votes.length:", votes.length)
	if (!votes) {
		return elements
	}

	console.log("ui.Game.VotingResults: BuildVotingResults()", votes.length)


	Object.entries(votes).forEach(([userId, votedFor]) => {
		const voteTarget = votedFor as string
		if (results[voteTarget] === undefined) {
			results[voteTarget] = 1
		} else {
			results[voteTarget]++
		}
	})
	// To sort voting results, we need an array, not an object. Let's get an array of [userId, count] and sort it.
	const sortedResults = Object.entries(results).sort((a, b) => b[1] - a[1])

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

	sortedResults.forEach(([userId, score]: [string, number]) => {
		const playerData = getPlayer({ userId: userId })
		if (!playerData) {
			console.error("ui.Game.VotingResults: BuildVotingResults: Failed to get player data for user", userId)
			return
		}

		const isEven            = elements.length % 2 === 0;
		const backgroundTexture = GetBackgroundTexture(isEven)

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
						avatarTexture: { userId: userId },
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


// MARK: Main GameUI
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
					margin        : { bottom                     : '35px' },
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
							color: Color4.fromHexString("#D89130")
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
