import ReactEcs, { Button, UiEntity} from '@dcl/sdk/react-ecs'
import { Color3, Color4, Vector3 } from '@dcl/sdk/math'
import { getSceneInformation } from '~system/Runtime'

import { ClientStore } from 'src/client/clientStore'
import { SeatManager } from 'src/client/seatManager'

import { ButtonAction, Divider, InfoRow, SectionHeader } from 'src/client/ui/ui.components'
import { ShowHowToPlay } from 'src/client/ui/ui.game.howToPlay'
import { DestroyPaparazzi, SpawnPaparazzi } from '../parparazzi'
import { MannequinManager } from '../mannequinManager'
import { StageController } from '../stageController'
import { NPCWinner } from '../npcWinner'
import { ShopManager } from '../shopManager'
import { Tutorial } from '../tutorial'
import { executeTask } from '@dcl/sdk/ecs'
import { movePlayerTo } from '~system/RestrictedActions'
import { GetRandomPointInSquare } from '../utils'
import { tweenValue } from './ui-utils'

const clientStore = ClientStore.getInstance()

const PANEL_HIDDEN = -230
const PANEL_VISIBLE = 40
const BTN_HIDDEN = -64
const BTN_VISIBLE = 202
var btnRight      : number = BTN_VISIBLE
var panelLeft     : number = PANEL_VISIBLE

var seatIndex: number = 1

export function DebugUI() {
	return (
		<UiEntity
			key="ui_debug_root"
			uiTransform={{
				width         : 250,
				height        : 720,
				flexDirection : 'column',
				alignItems    : 'flex-start',
				justifyContent: 'space-between',
				margin        : { top: '-220px', right: '50px' },
				padding       : '10px',
				position      : { left: panelLeft, top: 350 },
				positionType: "absolute",
				borderRadius  : { topLeft: 8, topRight: 24, bottomLeft: 8, bottomRight: 24 },
				borderColor   : Color4.fromHexString("#4C9581FF"),
				borderWidth   : 3
		}}
		uiBackground={{ color: Color4.fromHexString("#4C958166") }}
		>

			<UiEntity 
			uiTransform={{ 
				width: '48', 
				height: '32',
				borderRadius: 16,
				borderWidth: 3,
				borderColor: Color4.fromHexString("#4C9581FF"),
				positionType: 'absolute',
				position: { top: -32, right: btnRight },
				}}
			uiText={{
				value: "<-->",
				fontSize: 14,
			}}
			onMouseDown={() => {
				if (panelLeft > PANEL_HIDDEN) {
					tweenValue(btnRight, BTN_HIDDEN, 0.2, (v) => btnRight = v)
					tweenValue(panelLeft, PANEL_HIDDEN, 0.2, (v) => panelLeft = v)
				} else {
					tweenValue(panelLeft, PANEL_VISIBLE, 0.2, (v) => panelLeft = v)
					tweenValue(btnRight, BTN_VISIBLE, 0.2, (v) => btnRight = v)
				}
			}}
			/>

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
				<ButtonAction textLabel="Tutorial" callback={() => {
					Tutorial.TriggerTutorial(true);
				}} />

				<ButtonAction textLabel="GetSceneInformation" callback={() => {
					executeTask(async () => {
						const sceneInfo = await getSceneInformation({})
					
						if (!sceneInfo) return
					
						const sceneJson   = JSON.parse(sceneInfo.metadataJson)
						const spawnPoints = sceneJson.spawnPoints
						const spawnPos    = spawnPoints[0].position
						const corner1     = Vector3.create(spawnPos.x[0], spawnPos.y[0], spawnPos.z[0])
						const corner2     = Vector3.create(spawnPos.x[1], spawnPos.y[1], spawnPos.z[1])

						const cameraTarget = Vector3.create(spawnPoints[0].cameraTarget.x, spawnPoints[0].cameraTarget.y, spawnPoints[0].cameraTarget.z)

						//console.log("randomPoint", randomPoint.x, randomPoint.y, randomPoint.z)
						movePlayerTo({
							newRelativePosition: GetRandomPointInSquare(corner1, corner2),
							cameraTarget: cameraTarget
						})
					});
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