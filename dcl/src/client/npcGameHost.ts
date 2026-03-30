import { AvatarShape, Billboard, BillboardMode, engine, GltfContainer, InputAction, pointerEventsSystem, Transform } from "@dcl/sdk/ecs"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"
import { MessageType, room } from "../shared/room"
import { ClientStore } from "./clientStore"

export function SpawnGameHostNPC() {
	const position = Vector3.create(16, 0.4, 16)

	// Create the podium
	const podium = engine.addEntity()
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
	pointerEventsSystem.onPointerDown(
		{ 
			entity: podium, 
			opts: { 
				button: InputAction.IA_POINTER,
				hoverText: "Join/Start Game",
				maxDistance: 10
			} 
		},
		() => {
			const clientStore = ClientStore.getInstance()
			room.send(MessageType.REQUEST_JOIN_GAME, {
				displayName: clientStore.getDisplayName(),
				outfit     : {
					wearables: clientStore.getNPCWearables().map(w => w.urn),
					bodyShape: clientStore.getNPCBodyShape(),
					hairColor: clientStore.getNPCHairColor(),
					skinColor: clientStore.getNPCSkinColor(),
				}
			})
		}
	)


	// Create the NPC, parented to the podium, which has a billboard component

	const npcHost = engine.addEntity()
	Transform.create(npcHost, {
		parent: podium,
		position: Vector3.create(0, 0, 0),
		rotation: Quaternion.fromEulerDegrees(0, 180, 0),
		scale: Vector3.create(1.2, 1.2, 1.2)
	})

	// Spawn the Avatar
	AvatarShape.create(npcHost, {
		id       : "GH    ",
		name     : "Start a game 👇",
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
}