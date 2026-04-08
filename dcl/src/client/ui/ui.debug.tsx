import ReactEcs, { Button, UiEntity} from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'

import { ClientStore } from 'src/client/clientStore'
import { SeatManager } from 'src/client/seatManager'

import { ButtonAction, Divider, InfoRow, SectionHeader } from 'src/client/ui/ui.components'
import { ShowHowToPlay } from 'src/client/ui/ui.game.howToPlay'
import { DestroyPaparazzi, SpawnPaparazzi } from '../parparazzi'

const clientStore = ClientStore.getInstance()

export function DebugUI() {
	return (
		<UiEntity
			key="ui_debug_root"
			uiTransform={{
				width         : 300,
				height        : 500,
				flexDirection : 'column',
				alignItems    : 'flex-start',
				justifyContent: 'space-between',
				margin        : { top: '-220px', right: '50px' },
				padding       : '10px',
				position      : { left: 50, top: 350 },
				positionType: "absolute"
			}}
			uiBackground={{ color: Color4.fromHexString("#4C958166") }}
		>

			<SectionHeader title="Debug Menu" />

			<ButtonAction textLabel="ShowHowToPlay" callback={ShowHowToPlay} />
			<ButtonAction textLabel="MoveToLobby" callback={SeatManager.MovePlayerToLobby} />
			<ButtonAction textLabel="MoveToSeat(1)" callback={() => SeatManager.MovePlayerToSeat(1)} />
			<ButtonAction textLabel="SpawnPaparazzi" callback={() => SpawnPaparazzi()} />
			<ButtonAction textLabel="DestroyPaparazzi" callback={() => DestroyPaparazzi()} />
			

			<Divider />


			<SectionHeader title="ClientState" />

			<InfoRow label = "serverStatus"      value = {clientStore.getServerStatus()} />
			<InfoRow label = "gameStartTime"     value = {clientStore.getGameStartTime().toString()} />
			<InfoRow label = "playersInGame"     value = {clientStore.getPlayers().size.toString()} />
			<InfoRow label = "spectatorsInGame"  value = {clientStore.getSpectators().size.toString()} />
			<InfoRow label = "displayName"       value = {clientStore.getDisplayName()} />
			<InfoRow label = "enrolledInGame"    value = {clientStore.isEnrolledInGame().toString()} />
			<InfoRow label = "userId"            value = {clientStore.getUserId()} />
			<InfoRow label = "currentTurnUserId" value = {clientStore.getCurrentTurnUserId() ?? "NONE"} />


		</UiEntity>
	)
}