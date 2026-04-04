import { AvatarShape, Billboard, BillboardMode, engine, Entity, GltfContainer, InputAction, pointerEventsSystem, PointerEvents, Transform } from "@dcl/sdk/ecs"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"
import  * as utils from "@dcl-sdk/utils"

import { ClientMessaging } from "src/client/clientMessaging"
import { GameStatus } from "src/shared/enums"
import { eventBus } from "src/shared/utils/eventBus"
import { ClientEvents } from "./clientEvents"
import { ClientState } from "src/shared/types"
import { SoundManager } from "./soundManager"
import { sfx } from "./data/sfx"

var podium: Entity | undefined = undefined
var npcHost: Entity | undefined = undefined
var hostID = "GH    "

function getHoverText(status: GameStatus) {
	if (status == GameStatus.LOBBY) {
		return "Start Game"
	} else if (status == GameStatus.STARTING) {
		return "Join Game"
	} else if (status == GameStatus.STARTED || status == GameStatus.ROUND_ACTIVE) {
		return "Spectate Game"
	} else {
		return "Wait for the next game"
	}
}

function getAvatarLabel(status: GameStatus) {
	if (status == GameStatus.LOBBY) {
		return "Start a game 👇"
	} else if (status == GameStatus.STARTING) {
		return "Join the game 👇"
	} else if (status == GameStatus.STARTED || status == GameStatus.ROUND_ACTIVE) {
		return "Spectate game 👀"
	} else {
		return "Wait for the next game ⌚"
	}
}

eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
	updateGameHostNPC(data.serverStatus as GameStatus)
})

function updateGameHostNPC(status: GameStatus) {
	console.log("npcGameHost: updateGameHostNPC: status", status)
	if (!podium || !npcHost) {
		console.error("npcGameHost: updateGameHostNPC: podium or npcHost not found")
		return
	}

	// Clear PointerEvents so we do not stack PET_DOWN entries (stale hover text from the first registration).
	pointerEventsSystem.removeOnPointerDown(podium)
	PointerEvents.deleteFrom(podium)

	const hoverText = getHoverText(status)

	// Update the pointer system
	pointerEventsSystem.onPointerDown(
		{ 
			entity: podium, 
			opts: { 
				button: InputAction.IA_POINTER,
				hoverText,
				maxDistance: 10
			} 
		},
		() => {
			if (status == GameStatus.LOBBY || status == GameStatus.STARTING) {
				ClientMessaging.RequestJoinGame()
				SoundManager.PlaySound(sfx.startGame)
			} else if (status == GameStatus.STARTED || status == GameStatus.ROUND_ACTIVE) {
				SoundManager.PlaySound(sfx.startGame)
				//TODO: figure out spectate functionality
			} else {
				eventBus.emit(ClientEvents.NOTIFY_WARNING, "Please wait for the next game to start")
			}
		}
	)
	
	// Update the Avatar Label
	hostID += " "
	AvatarShape.deleteFrom(npcHost)
	utils.timers.setTimeout(() => {
		AvatarShape.create(npcHost!, {
			id       : hostID,
			name     : getAvatarLabel(status),
			bodyShape: "urn:decentraland:off-chain:base-avatars:BaseFemale",
			wearables: [
				"urn:decentraland:matic:collections-v2:0x257fe095f35877587dcd29431e3008b3a8fe7c1c:0", // head
				"urn:decentraland:matic:collections-v2:0xcce34685b5bb894c5bb2246728e8f85b0dbb6a43:0", // hair
				"urn:decentraland:matic:collections-v2:0x11c59ac0a8a4c3f92b40433a540615191588b6e9:0", // necklace
				"urn:decentraland:matic:collections-v2:0x9ef30e8babfd367e2f31f3374ffe35ff4862e914:0", // dress
				"urn:decentraland:matic:collections-v2:0x5a22a1d25d6f7c2d46903156db56d479f5b9d1e4:0", // shoes
				"urn:decentraland:matic:collections-v2:0xd70a2c52cfb19403bcbf6e59a26364b30a853477:0", // aura
				"urn:decentraland:matic:collections-v2:0x9d25f6b3080ce522e807ab6038a7f7b9c5e83110:0", // hands
				"urn:decentraland:matic:collections-v2:0xb249ea4a94198ccfd27cfef97b1d797d03a84910:0", // earrings
			],
			eyeColor : Color3.fromHexString("#d83030"),
			skinColor: Color3.fromHexString("#CC9B77"),
			hairColor: Color3.fromHexString("#ebebeb"),
			emotes: []
		})
	}, 100)
}

export function SetupGameHostNPC() {
	const position = Vector3.create(16, 0.4, 16)

	// Create the podium
	podium = engine.addEntity()
	Transform.create(podium, {
		position: position,
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale: Vector3.create(1, 1, 1)
	})
	Billboard.create(podium, {
		billboardMode: BillboardMode.BM_Y
	})
	GltfContainer.create(podium, {
		src: "assets/models/podium.gltf",
	})


	// Create the NPC, parented to the podium, which has a billboard component
	npcHost = engine.addEntity()
	Transform.create(npcHost, {
		parent: podium,
		position: Vector3.create(0, 0, 0),
		rotation: Quaternion.fromEulerDegrees(0, 180, 0),
		scale: Vector3.create(1.2, 1.2, 1.2)
	})
	updateGameHostNPC(GameStatus.LOBBY)
}