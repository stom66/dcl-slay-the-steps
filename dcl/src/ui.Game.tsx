import ReactEcs, { Button, Label, ReactEcsRenderer, TextureMode, UiEntity } from '@dcl/sdk/react-ecs'

import { Color3, Color4, Vector3 } from '@dcl/sdk/math'

import { MessageBus } from '@dcl/sdk/message-bus'
import { _GameManager, GameStatus, localPlayer } from './GameManager'
import { GetPlayerAvatarImage, GetPlayerName, onPlayerProfileLoaded } from './utils'

const sceneMessageBus = new MessageBus()

// Root Element visibility
var visibleHowToPlay: boolean = false
var visiblePlayerList: boolean = true
var visibleVoting: boolean = false
var visibleVotingResults: boolean = false
var visibleWarning: boolean = false
var visibleCountdownTimer: boolean = false

// Placeholders for dynamic content
let playerList: any[] = [];
let votingOptions: any[] = [];
let votingResults: any[] = [];
let votedFor: string = ""
let warningText: string = ""


export function ShowVoting() {
	visibleVoting = true
	votingOptions = BuildVotingOptions()
}
export function HideVoting() {
	visibleVoting = false
}

export function ShowCountdownTimer() {
	visibleCountdownTimer = true
}
export function HideCountdownTimer() {
	visibleCountdownTimer = false
}

export function ShowVotingResults() {
	HideVoting()
	UpdateVotingResults()
	visibleVotingResults = true
}
export function HideVotingResults() {
	visibleVotingResults = false
	votedFor = ""
}

export function ShowWarning(text: string) {
	visibleWarning = true
	warningText = text
}

export function HideWarning() {
	visibleWarning = false
	warningText = ""
}

export function UpdatePlayerList() {
	playerList = BuildPlayerList()
}

export function UpdateVotingOptions() {
	votingOptions = BuildVotingOptions()
}

export function UpdateVotingResults() {
	votingResults = BuildVotingResults()
}

onPlayerProfileLoaded((userId: string) => {
	UpdatePlayerList()
	UpdateVotingOptions()
	UpdateVotingResults()
})

const fakePlayers = [
	"0xcec7e38e088a87d77f2b60fcae6840d00e018155",// stom
	"0x56469159D91eb810dCE34dd13eC4eD8194bCA7be",// NikkiFuego
	"0x1F844B7261a32A28E2d1894886f3dcD4ef227d16",// mf25hape
	"0x571f1Fb1F6B7b51E74e2a1DE956f2CE3242A1ac6",// standout
]
const fakeVoteData = {
	"0x1F844B7261a32A28E2d1894886f3dcD4ef227d16": "0x56469159D91eb810dCE34dd13eC4eD8194bCA7be",
	"0x56469159D91eb810dCE34dd13eC4eD8194bCA7be": "0x571f1Fb1F6B7b51E74e2a1DE956f2CE3242A1ac6",
	"0x571f1Fb1F6B7b51E74e2a1DE956f2CE3242A1ac6": "0xcec7e38e088a87d77f2b60fcae6840d00e018155",
	"0xcec7e38e088a87d77f2b60fcae6840d00e018155": "0xcec7e38e088a87d77f2b60fcae6840d00e018155",
}

function VoteForWinner(userId: string) {
	if (votedFor === userId) {
		votedFor = ""
	} else {
		votedFor = userId
	}

	console.log("VoteForWinner()",)
	UpdateVotingOptions()
	sceneMessageBus.emit('requestVote', {
		voteFrom: localPlayer.userId,
		voteFor: userId
	})
}

// MARK: BuildVotingOptions
function BuildVotingOptions() {
	let elements: any[] = []

	//const playerList = fakePlayers
	const playerList = _GameManager.state.players

	//_GameManager.state.players.forEach((votingOption: string) => {
	playerList.forEach((userId: string) => {
		const playerName = GetPlayerName(userId)
		const playerAvatarImage = GetPlayerAvatarImage(userId)
		const currentIndex = elements.length;
		const isEven = currentIndex % 2 === 0;
		const backgroundTexture = isEven
			? "assets/images/ui/bg-purple-dark.png"
			: "assets/images/ui/bg-purple-light.png";

		elements.push(
			<UiEntity
				key={`voting_option_${userId}`}
				uiTransform={{
					width: "100%",
					height: 48,
					flex: 1,
					flexShrink: 1,
					flexDirection: 'row',
					padding: { left: 8, right: 6, top: 6, bottom: 6 },
					margin: { bottom: 8 },
				}}
				uiBackground={{
					texture: {
						src: backgroundTexture
					},
					textureMode: "nine-slices",
					textureSlices: {
						top: 0.25,
						bottom: 0.75,
						left: 0.5,
						right: 0.5
					}

				}}
			>
				<UiEntity
					key={`voting_option_avatar_${userId}`}
					uiTransform={{
						width: 36,
						height: 36,
						margin: { right: 10 },
					}}
					uiBackground={{
						texture: {
							src: playerAvatarImage
						},
						textureMode: "stretch"
					}}
				/>
				<Label
					key={`voting_option_label_${userId}`}
					uiTransform={{
						height: "100%",
						flexGrow: 1,
					}}
					fontSize={16}
					font='sans-serif'
					color={Color4.White()}
					value={playerName}
					textWrap='nowrap'
					textAlign="middle-left"
				/>
				<Button
					key={`voting_option_button_${userId}`}
					uiTransform={{
						width: 92,
						height: 36,
						display: userId !== localPlayer.userId ? 'flex' : 'none',
					}}
					value=""
					fontSize={16}
					font='sans-serif'
					color={Color4.Black()}
					variant='secondary'
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

// MARK: BuildPlayerList
function BuildPlayerList() {
	let elements: any[] = []

	let gameStateImage = "assets/images/ui/text-idle.png"
	switch (_GameManager.state.gameState) {
		case GameStatus.STARTING:
			gameStateImage = "assets/images/ui/text-game-starting.png"
			break
		case GameStatus.ROUND_ACTIVE:
			gameStateImage = "assets/images/ui/text-game-in-progress.png"
			break
		case GameStatus.VOTING:
			gameStateImage = "assets/images/ui/text-voting-in-progress.png"
			break
		case GameStatus.GAME_ENDED:
			gameStateImage = "assets/images/ui/text-voting-finished.png"
			break
	}

	_GameManager.state.players.forEach((userId: string) => {
		const currentIndex = elements.length;
		const isEven = currentIndex % 2 === 0;
		const backgroundTexture = isEven
			? "assets/images/ui/bg-purple-dark.png"
			: "assets/images/ui/bg-purple-light.png";
		elements.push(
			<UiEntity
				key={`player_${userId}_root`}
				uiTransform={{
					width: "100%",
					height: 42,
					padding: { left: 10, right: 10 },
					flexGrow: 1,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'flex-start',
					margin: { bottom: 4 },
				}}
				uiBackground={{
					texture: {
						src: backgroundTexture
					},
					textureMode: "nine-slices",
					textureSlices: {
						top: 0.25,
						bottom: 0.75,
						left: 0.5,
						right: 0.5
					}
				}}
			>
				<UiEntity
					key={`player_${userId}_avatar`}
					uiTransform={{
						width: 40,
						height: 40,
						margin: { right: 10 },
					}}
					uiBackground={{
						avatarTexture: { userId: userId },
						textureMode: "stretch"
					}}
				/>
				<Label
					key={`player_${userId}_label`}
					uiTransform={{
						height: 40,
						flexGrow: 1,
					}}
					fontSize={16}
					font='sans-serif'
					value={GetPlayerName(userId)}
					textWrap='nowrap'
					textAlign="middle-right"
				/>
			</UiEntity>
		)
	})

	if (elements.length < 1) {
		elements.push(
			<UiEntity
				key={`player_list_empty`}
				uiTransform={{
					width: 240,
					height: 48,
					alignSelf: "center",
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/text-no-players.png"
					},
					textureMode: "stretch",
				}}
			></UiEntity>
		)
	}

	console.log("BuildPlayerList()", elements)
	return elements
}
UpdatePlayerList()

// MARK: BuildVotingResults
function BuildVotingResults() {
	let elements: any[] = []
	const results: Record<string, number> = {}


	//const votes = fakeVoteData // DEBUG DATA
	const votes = _GameManager.state.votes
	console.log("BuildVotingResults(), votes.length:", votes.length)
	if (!votes) {
		return elements
	}

	console.log("BuildVotingResults()", votes.length)


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

	sortedResults.forEach(([userId, score]: [string, number]) => {
		const playerName = GetPlayerName(userId)
		const playerAvatarImage = GetPlayerAvatarImage(userId)
		const isEven = elements.length % 2 === 0;
		const backgroundTexture = isEven
			? "assets/images/ui/bg-purple-dark.png"
			: "assets/images/ui/bg-purple-light.png";

		elements.push(
			<UiEntity
				key={`voting_result_${userId}`}
				uiTransform={{
					width: "100%",
					height: 48,
					flex: 1,
					flexShrink: 1,
					flexDirection: 'row',
					padding: { left: 8, right: 6, top: 6, bottom: 6 },
					margin: { bottom: 8 },
				}}
				uiBackground={{
					texture: {
						src: backgroundTexture
					},
					textureMode: "nine-slices",
					textureSlices: {
						top: 0.25,
						bottom: 0.75,
						left: 0.5,
						right: 0.5
					}

				}}
			>
				<UiEntity
					key={`voting_result_${userId}_avatar`}
					uiTransform={{
						width: 36,
						height: 36,
						margin: { right: 10 },
					}}
					uiBackground={{
						texture: {
							src: playerAvatarImage
						},
						textureMode: "stretch"
					}}
				/>
				<Label
					key={`voting_result_${userId}_name`}
					uiTransform={{
						height: "100%",
						flexGrow: 1,
					}}
					fontSize={16}
					font='sans-serif'
					color={Color4.White()}
					value={playerName}
					textWrap='nowrap'
					textAlign="middle-left"
				/>
				<UiEntity
					key={`voting_result_${userId}_iconStar`}
					uiTransform={{
						width: 36,
						height: 36,
						margin: { right: 10 },
						display: elements.length === 0 ? 'flex' : 'none',
					}}
					uiBackground={{
						texture: { src: "assets/images/ui/icon-star.png" },
						textureMode: "stretch"
					}}
				/>
				<Label
					key={`voting_result_${userId}_score`}
					uiTransform={{
						height: "100%",
						margin: { right: 16 },
					}}
					fontSize={16}
					font='sans-serif'
					color={Color4.White()}
					value={score.toString()}
					textAlign="middle-center"

				/>
			</UiEntity>
		)
	})
	return elements
}

// MARK: Main GameUI
export function GameUI() {

	return (
		<UiEntity
			key={`ui_root`}
			uiTransform={{
				width: '100%',
				height: '100%',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: visibleCountdownTimer ? 'flex-start' : 'center',
				positionType: "absolute",
			}}
		>

			{/* 
			MARK: How To Play
			*/}
			<UiEntity
				key={`ui_HowToPlay_root`}
				uiTransform={{
					width: 720,
					height: 369,
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'space-between',
					margin: { bottom: '35px' },
					display: visibleHowToPlay ? 'flex' : 'none'
				}}
				uiBackground={{
					texture: {
						src: "assets/images/how-to-play.png"
					},
					textureMode: "stretch"

				}}
			>
			</UiEntity>

			{/* 
			MARK: Voting
			*/}
			<UiEntity
				key={`ui_Voting_root`}
				uiTransform={{
					width: 420,
					height: 'auto',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'space-evenly',
					alignSelf: 'center',
					flexShrink: 1,
					margin: { bottom: '35px' },
					display: visibleVoting ? 'flex' : 'none',
					padding: { top: 32, bottom: 32, left: 16, right: 16 },
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-purple-border.png"
					},
					textureMode: "nine-slices",
					textureSlices: {
						top: 0.5,
						bottom: 0.5,
						left: 0.5,
						right: 0.5
					}

				}}
			>
				<UiEntity
					key={`ui_Voting_close`}
					uiTransform={{
						width: 48,
						height: 48,
						positionType: "absolute",
						position: { top: -8, right: -8 },
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/btn-circle.png"
						},
						textureMode: "stretch"
					}}
				>
					<Button
						key={`ui_Voting_close_button`}
						uiTransform={{
							width: "100%",
							height: "100%",
						}}
						uiBackground={{
							texture: {
								src: "assets/images/ui/icon-close.png"
							},
							textureMode: "center",
							color: Color4.Purple()
						}}
						value=""
						onMouseUp={() => HideVoting()}
					/>
				</UiEntity>
				<UiEntity
					key={`ui_Voting_header`}
					uiTransform={{
						width: "100%",
						height: 64,
					}}
					uiText={{
						value: "Vote for the Winner",
						fontSize: 24,
					}}
				/>

				{votingOptions}
			</UiEntity>

			{/* 
			MARK: Voting Results
			*/}
			<UiEntity
				key={`ui_VotingResults_root`}
				uiTransform={{
					width: 420,
					height: 'auto',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'space-evenly',
					alignSelf: 'center',
					flexShrink: 1,
					margin: { bottom: '35px' },
					display: visibleVotingResults ? 'flex' : 'none',
					padding: { top: 16, bottom: 32, left: 16, right: 16 },
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-purple-border.png"
					},
					textureMode: "nine-slices",
					textureSlices: {
						top: 0.5,
						bottom: 0.5,
						left: 0.5,
						right: 0.5
					}

				}}
			>
				<UiEntity
					key={`ui_VotingResults_close`}
					uiTransform={{
						width: 48,
						height: 48,
						positionType: "absolute",
						position: { top: -8, right: -8 },
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/btn-circle.png"
						},
						textureMode: "stretch"
					}}
				>
					<Button
						key={`ui_VotingResults_close_button`}
						uiTransform={{
							width: "100%",
							height: "100%",
						}}
						uiBackground={{
							texture: {
								src: "assets/images/ui/icon-close.png"
							},
							textureMode: "center",
							color: Color4.Purple()
						}}
						value=""
						onMouseUp={() => HideVotingResults()}
					/>
				</UiEntity>
				<UiEntity
					key={`ui_VotingResults_header`}
					uiTransform={{
						width: "100%",
						height: 64,
					}}
					uiText={{
						value: "Vote Results",
						fontSize: 24,
					}}
				/>

				{votingResults}
			</UiEntity>

			{/* 
			MARK: Warning
			*/}
			<UiEntity
				key={`ui_Warning_root`}
				uiTransform={{
					width: 420,
					height: 'auto',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'flex-end',
					alignSelf: 'center',
					flexShrink: 1,
					margin: { bottom: '35px' },
					display: visibleWarning ? 'flex' : 'none',
					padding: { top: 16, bottom: 16, left: 16, right: 16 },
					positionType: "absolute",
					position: { top: '45%' },
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-purple-border.png"
					},
					textureMode: "nine-slices",
					textureSlices: {
						top: 0.5,
						bottom: 0.5,
						left: 0.5,
						right: 0.5
					}

				}}
			>
				<UiEntity
					key={`ui_Warning_close`}
					uiTransform={{
						width: 36,
						height: 36,
						positionType: "absolute",
						position: { top: -8, right: -8 },
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/btn-circle.png"
						},
						textureMode: "stretch"
					}}
				>
					<Button
						key={`ui_Warning_close_button`}
						uiTransform={{
							width: "100%",
							height: "100%",
						}}
						uiBackground={{
							texture: {
								src: "assets/images/ui/icon-close.png"
							},
							textureMode: "stretch",
							color: Color4.Purple()
						}}
						value=""
						onMouseUp={() => HideWarning()}
					/>
				</UiEntity>
				<Label
					key={`ui_Warning_text`}
					uiTransform={{
						width: "100%",
						height: 48,
					}}
					value={warningText}
					fontSize={20}
				/>
				<Button
					key={`ui_Warning_close_button`}
					uiTransform={{
						width: 92,
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
					value=""
					onMouseUp={() => HideWarning()}
				/>
			</UiEntity>



			{/* 
				MARK: Player List
			*/}
			<UiEntity
				key={`ui_PlayerList_root`}
				uiTransform={{
					width: 300,
					positionType: "absolute",
					position: { top: '100px', right: '64px' },
					flexGrow: 1,
					flexDirection: 'column',
					alignItems: 'flex-start',
					justifyContent: 'flex-start',
					display: 'flex',
					padding: { left: 18, bottom: 22, right: 18, top: 0 }
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-purple-border.png"
					},
					textureMode: "nine-slices",
					textureSlices: {
						top: 0.4,
						bottom: 0.6,
						left: 0.5,
						right: 0.5
					}
				}}
			>
				<UiEntity
					uiTransform={{
						width: 90,
						height: 60,
						positionType: "relative",
						position: { top: -22 },
						display: "flex",
						alignSelf: "center",
						alignItems: "center",
						justifyContent: "center",
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/bg-purple-border.png"
						},
						textureMode: "stretch",
					}}
				>

					<UiEntity
						uiTransform={{
							width: 75,
							height: 50,
						}}
						uiBackground={{
							texture: {
								src: "assets/images/ui/icon-neon-cat.png"
							},
							textureMode: "stretch",
						}}
					/>
				</UiEntity>
				<UiEntity
					key={`ui_PlayerList_header`}
					uiTransform={{
						width: 240,
						height: 48,
						margin: { top: -32 },
						alignSelf: "center",
					}}
					uiBackground={{
						texture: {
							src: "assets/images/ui/text-players.png"
						},
						textureMode: "stretch",
					}}
				>
				</UiEntity>

				{playerList}
			</UiEntity>

			{/* 
			MARK: Countdown timer
			*/}
			<UiEntity
				key={`ui_CountdownTimer_root`}
				uiTransform={{
					width: 340,
					height: 120,
					flexShrink: 0,
					flexDirection: 'row',
					alignItems: 'center',
					justifyContent: 'center',

					margin: { top: '35px' },
					display: visibleCountdownTimer ? 'flex' : 'none'
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-countdown.png"
					},
					textureMode: "stretch",

				}}
			>
				<UiEntity
					key={`ui_CountdownTimer_value`}
					uiTransform={{
						width: 128,
						height: 64,
						margin: { right: 42 },
					}}
					uiText={{
						value: _GameManager.countdownValue.toString(),
						fontSize: 64,
						textAlign: "middle-center",
						color: Color4.White()
					}}
				/>


			</UiEntity>
		</UiEntity>
	)
}


// MARK: Show/Hide Funcs
export function ShowHowToPlay() {
	console.log("ShowHowToPlay()")
	visibleHowToPlay = true
}
export function HideHowToPlay() {
	visibleHowToPlay = false
}

export function ShowPlayerList() {
	console.log("ShowPlayerList()")
	visiblePlayerList = true
}
export function HidePlayerList() {
	console.log("HidePlayerList()")
	visiblePlayerList = false
}