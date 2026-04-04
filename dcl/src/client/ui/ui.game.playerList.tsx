import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { GameStatus } from 'src/shared/enums'
import { ClientState, NotifyStatePayload } from 'src/shared/types'
import { eventBus } from 'src/shared/utils/eventBus'
import { userProfileCache } from 'src/shared/utils/userProfileCache'

import { GetBackgroundTexture } from 'src/client/utils'
import { ClientStore } from 'src/client/clientStore'
import { ClientEvents } from 'src/client/clientEvents'
import { NotifyTurnStartingPayload } from 'src/shared/types'


const clientStore = ClientStore.getInstance()
// Placeholders for dynamic content
let currentPlayer    : undefined | string = ""   // userId of the currently active player to show the star icon during a round
let playerList       : any[]              = []   // array of UIElements for each player

const avatarUrlByUserId = new Map<string, string>()
const avatarUrlRequestInFlight = new Set<string>()

function requestAvatarUrl(userId: string) {
	if (avatarUrlRequestInFlight.has(userId)) return

	avatarUrlRequestInFlight.add(userId)
	void userProfileCache.getUserAvatarUrl(userId)
		.then((avatarUrl: string) => {
			if (!avatarUrl) return
			if (avatarUrlByUserId.get(userId) === avatarUrl) return

			avatarUrlByUserId.set(userId, avatarUrl)
			UpdatePlayerList()
		})
		.catch((error) => {
			console.error("ui.Game.PlayerList: requestAvatarUrl(): Failed for user", userId, error)
		})
		.finally(() => {
			avatarUrlRequestInFlight.delete(userId)
		})
}


// Utility functions


export function SetCurrentPlayer(userId?: string) {
	currentPlayer = userId
	UpdatePlayerList()
}

// Event Binding
eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
	UpdatePlayerList()
})

eventBus.on(ClientEvents.NOTIFY_TURN_STARTING, (data: NotifyTurnStartingPayload) => {
	SetCurrentPlayer(data.outfit.userId)
})


// MARK: BuildPlayerList
function BuildPlayerList() {
	const playersMap = clientStore.getPlayers()

	// Debugging incorrect AvatarTextures showing up
	const userIds: string[] = Array.from(playersMap.keys())

	console.log("ui.Game.PlayerList: BuildPlayerList(): adding", userIds.length, "elements for userIDs:")
	userIds.forEach((userId: string) => {
		console.log(userId)
	})
	
	let elements: any[] = []

	// Build the "row" elements
	userIds.forEach((userId: string) => {
		const displayName = playersMap.get(userId) ?? userId

		const isEven    = elements.length % 2 === 0
		const bgTexture = GetBackgroundTexture(isEven)
		const avatarTexture = avatarUrlByUserId.get(userId) ?? ""
		if (!avatarTexture) {
			requestAvatarUrl(userId)
		}

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
						texture: { src: avatarTexture },
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
					value     = {displayName}
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
function UpdatePlayerList() {
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
				display       : 'flex',
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
