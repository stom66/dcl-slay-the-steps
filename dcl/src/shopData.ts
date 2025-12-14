import { Quaternion, Vector3 } from "@dcl/sdk/math";

export type ShopItem = {
	position : Vector3
	rotation?: Quaternion,
	scale?   : Vector3,
	isMale?  : boolean,
	urn      : string
}

// Big list of the items to be shown in the shop
export const shopData: Record<string, ShopItem> = {

	// Each entry needs a unique key (item0, item1 etc) but it can be anything you want
	// Each entry needs at least urn and position
	// If items don't show up, try setting isMale: true
	// Avatars default to using female base shape

	"item0": {
		position: Vector3.create(0+12, 1, 10),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale   : Vector3.create(1.5, 1.5, 1.5),
		isMale  : true,
		urn     : "urn:decentraland:matic:collections-v2:0xed0c8eaf9d0a04a24701a90da2580da9cf46fb45:6:631873750011343120187508166102022593913370572403294667525865865222"
	},
	"item1": {
		position: Vector3.create(1+12, 1, 10),
		urn     : "urn:decentraland:matic:collections-v2:0x2c363fb15c0f98e26add137dcacf24463915095b:3:315936875005671560093754083051011296956685286201647333762932932612"
	},
	"item2": {
		position: Vector3.create(2+12, 1, 10),
		urn     : "urn:decentraland:off-chain:base-avatars:dcl_watch"
	},
	"item3": {
		position: Vector3.create(3+12, 1, 10),
		urn     : "urn:decentraland:matic:collections-v2:0xf55afae51e08920469fcfd05c6d1c9905370e3d1:5:526561458342785933489590138418352161594475477002745556271554887684",
		isMale  : true
	},
	"bearSlipper": {
		position: Vector3.create(4+12, 1, 10),
		urn     : "urn:decentraland:off-chain:base-avatars:bear_slippers"
	},
	"skull": {
		position: Vector3.create(5+12, 1, 10),
		urn     : "urn:decentraland:off-chain:base-avatars:f_skull_earring"
	},
	"bandana": {
		position: Vector3.create(6+12, 1, 10),
		urn     : "urn:decentraland:off-chain:base-avatars:red_bandana"
	},
	"hair": {
		position: Vector3.create(7+12, 1, 10),
		urn     : "urn:decentraland:off-chain:base-avatars:slicked_hair"
	}
}


