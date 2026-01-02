import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { getPlayer } from '@dcl/sdk/players'
import { Color4 } from '@dcl/sdk/math'

import { GetBackgroundTexture } from './utils'
import { GameManager } from './GameManager'


// Placeholders for dynamic content
let currentPlayer    : undefined | string = ""   // userId of the currently active player to show the star icon during a round
let playerList       : any[]              = []   // array of UIElements for each player
var visiblePlayerList: boolean            = true // unused - toggles root element visibility


// Utility functions
export function ShowPlayerList() {
	console.log("ui.Game.PlayerList: ShowPlayerList()")
	visiblePlayerList = true
}
export function HidePlayerList() {
	console.log("ui.Game.PlayerList: HidePlayerList()")
	visiblePlayerList = false
}

export function SetCurrentPlayer(userId?: string) {
	currentPlayer = userId
	UpdatePlayerList()
}


// MARK: BuildPlayerList
function BuildPlayerList() {

	// Defensive check: ensure GameManager is initialized
	if (!GameManager || !GameManager.state) {
		return []
	}

	// Debugging incorrect AvatarTextures showing up
	const userIds: string[] = GameManager.state.players.map(
		(userId: string) => userId
	)
	console.log("ui.Game.PlayerList: BuildPlayerList(): adding", userIds.length, "elements for userIDs:")
	userIds.forEach((userId: string) => {
		console.log(userId)
	})
	
	let elements: any[] = []

	// Build the "row" elements
	userIds.forEach((userId: string) => {
		// Fetch the player data, so we can get their name
		const playerData = getPlayer({ userId: userId })
		if (!playerData) {
			console.error("ui.Game.PlayerList: BuildPlayerList(): Failed to get player data for user", userId)
			return
		}

		const isEven    = elements.length % 2 === 0
		const bgTexture = GetBackgroundTexture(isEven)

		elements.push(
			<UiEntity
				key={`player_${userId}_root`}
				uiTransform={{
					width         : "100%",
					height        : 42,
					padding       : { left: 10, right: 10 },
					flexGrow      : 1,
					flexDirection : 'row',
					alignItems    : 'center',
					justifyContent: 'flex-start',
					margin        : { bottom: 4 },
				}}
				uiBackground={{
					texture: {
						src: bgTexture
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
					key={`player_${userId}_avatar`}
					uiTransform={{
						width : 40,
						height: 40,
						margin: { right: 10 },
					}}
					uiBackground={{
						avatarTexture: { userId: userId },
						textureMode  : "stretch"
					}}
				/>
				<UiEntity
					key={`player_${userId}_iconStar`}
					uiTransform={{
						width  : 36,
						height : 36,
						margin : { right: 10 },
						display: currentPlayer === userId ? 'flex' : 'none',
					}}
					uiBackground={{
						texture    : { src: "assets/images/ui/icon-star.png" },
						textureMode: "stretch"
					}}
				/>
				<Label
					key={`player_${userId}_label`}
					uiTransform={{
						height  : 40,
						flexGrow: 1,
					}}
					fontSize  = {16}
					font      = 'sans-serif'
					value     = {playerData.name}
					textWrap  = 'nowrap'
					textAlign = "middle-right"
					color     = {Color4.Black()}
				/>
			</UiEntity>
		)
	})

	// If no players, add the "no players" image
	if (elements.length < 1) {
		elements.push(
			<UiEntity
				key={`player_list_empty`}
				uiTransform={{
					width    : 240,
					height   : 48,
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

	return elements
}


// MARK: UpdatePlayerList
export function UpdatePlayerList() {
	playerList = BuildPlayerList()
}

UpdatePlayerList()


// MARK: Main PlayerList UI
export function PlayerListUI() {
	// DISABLED: Constantly refresh the player list every frame
	// An effort to combat a bug with the AvatarTexture being incorrect. It does not work.

	//if (visiblePlayerList) {
	//	playerList = BuildPlayerList()
	//}
	return (
		<UiEntity
			key={`ui_PlayerList_root`}
			uiTransform={{
				width         : 300,
				positionType  : "absolute",
				position      : { top: '100px', right: '64px' },
				flexGrow      : 1,
				flexDirection : 'column',
				alignItems    : 'flex-start',
				justifyContent: 'flex-start',
				display       : visiblePlayerList ? 'flex': 'none',
				padding       : { left: 18, bottom: 22, right: 18, top: 0 }
			}}
			uiBackground={{
				texture: {
					src: "assets/images/ui/bg-square-border.png"
				},
				textureMode: "nine-slices",
				textureSlices: {
					top   : 0.4,
					bottom: 0.6,
					left  : 0.5,
					right : 0.5
				}
			}}
		>
			<UiEntity
				key={`ui_PlayerList_body`}
				uiTransform={{
					width         : 90,
					height        : 60,
					positionType  : "relative",
					position      : { top: -22 },
					display       : "flex",
					alignSelf     : "center",
					alignItems    : "center",
					justifyContent: "center",
				}}
				uiBackground={{
					texture: {
						src: "assets/images/ui/bg-square.png"
					},
					textureMode: "nine-slices",
					textureSlices: {
						top   : 0.4,
						bottom: 0.6,
						left  : 0.5,
						right : 0.5
					}
				}}
			>

				<UiEntity
					key={`ui_PlayerList_icon`}
					uiTransform={{
						width : 75,
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
					width    : 240,
					height   : 48,
					margin   : { top: -32 },
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
	)
}
