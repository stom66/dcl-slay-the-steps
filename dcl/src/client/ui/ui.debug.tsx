import ReactEcs, { Button, UiEntity} from '@dcl/sdk/react-ecs'
import { Color3, Color4 } from '@dcl/sdk/math'

import { ClientStore } from 'src/client/clientStore'
import { SeatManager } from 'src/client/seatManager'

import { ButtonAction, Divider, InfoRow, SectionHeader } from 'src/client/ui/ui.components'
import { ShowHowToPlay } from 'src/client/ui/ui.game.howToPlay'
import { DestroyPaparazzi, SpawnPaparazzi } from '../parparazzi'
import { MannequinManager } from '../mannequinManager'
import { StageController } from '../stageController'
import { NPCWinner } from '../npcWinner'
import { ShopManager } from '../shopManager'

const clientStore = ClientStore.getInstance()

var seatIndex: number = 1

export function DebugUI() {
	return (
		<UiEntity
			key="ui_debug_root"
			uiTransform={{
				width         : 250,
				height        : 640,
				flexDirection : 'column',
				alignItems    : 'flex-start',
				justifyContent: 'space-between',
				margin        : { top: '-220px', right: '50px' },
				padding       : '10px',
				position      : { left: 50, top: 350 },
				positionType: "absolute",
				borderRadius  : { topLeft: 8, topRight: 24, bottomLeft: 8, bottomRight: 24 },
				borderColor   : Color4.fromHexString("#4C9581FF"),
			borderWidth   : 3
		}}
		uiBackground={{ color: Color4.fromHexString("#4C958166") }}
		>

			<UiEntity uiTransform={{ width: '100%', flexDirection: 'column' }}>
				<SectionHeader title="Debug Menu" />

				<ButtonAction textLabel="MoveToLobby" callback={() => SeatManager.MovePlayerToLobby()} />
				<ButtonAction textLabel={`MoveToSeat(${seatIndex})`} callback={() => {SeatManager.MovePlayerToSeat(seatIndex, true); seatIndex++; seatIndex = seatIndex % 16;} }/>
				<ButtonAction textLabel="SpawnPaparazzi" callback={() => SpawnPaparazzi()} />
				<ButtonAction textLabel="DestroyPaparazzi" callback={() => DestroyPaparazzi()} />
				<ButtonAction textLabel="ShowMannequin" callback={() => MannequinManager.ShowNPCMannequin()} />
				<ButtonAction textLabel="HideMannequin" callback={() => MannequinManager.HideNPCMannequin()} />
				<ButtonAction textLabel="SpawnWinner (dummy)" callback={() => {
					clientStore.setLastWinner({
						userId: "0xCEC7e38e088A87D77F2B60Fcae6840D00E018155",
						displayName: "Test Player" + Math.random().toString(36).substring(2, 4),
						outfit: {
							userId: "0xCEC7e38e088A87D77F2B60Fcae6840D00E018155",
							bodyShape: "urn:decentraland:off-chain:base-avatars:BaseMale",
							wearables: [],
							hairColor: Color3.Red(),
							skinColor: Color3.Red()
						}
					})
					NPCWinner.SpawnNPCWinner();
					}} />
					<ButtonAction textLabel="SpawnWinner(undefined)" callback={() => {
						clientStore.setLastWinner(undefined)
						NPCWinner.SpawnNPCWinner();
					}} />
					<ButtonAction textLabel="RandomiseZones" callback={() => {
						ShopManager.RandomiseZones();
					}} />
			</UiEntity>

			<Divider />

			<UiEntity uiTransform={{ width: '100%', flexDirection: 'column' }}>
				<SectionHeader title="ClientState" />

				<InfoRow label = "serverStatus"      value = {clientStore.getServerStatus()} />
				<InfoRow label = "gameStartTime"     value = {clientStore.getGameStartTime().toString()} />
				<InfoRow label = "playersInGame"     value = {clientStore.getPlayers().size.toString()} />
				<InfoRow label = "spectatorsInGame"  value = {clientStore.getSpectators().size.toString()} />
				<InfoRow label = "displayName"       value = {clientStore.getDisplayName()} />
				<InfoRow label = "enrolledInGame"    value = {clientStore.isEnrolledInGame().toString()} />
				<InfoRow label = "userId"            value = {clientStore.getUserId()} />
				<InfoRow label = "currentTurnUserId" value = {clientStore.getCurrentTurnUserId() ?? "NONE"} />
				<InfoRow label = "NPC Count"         value = {StageController.npcs.length.toString()} />
			</UiEntity>


		</UiEntity>
	)
}