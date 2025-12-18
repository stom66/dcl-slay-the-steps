import { Quaternion, Vector3 } from "@dcl/sdk/math";

export type ShopItem = {
	position   : Vector3
	rotation?  : Quaternion,
	scale?     : Vector3,
	isMale?    : boolean,
	showAvatar?: boolean,
	urn        : string
}

// Big list of the items to be shown in the shop
export const shopData: Record<string, ShopItem> = {

	// Each entry needs a unique key (item0, item1 etc) but it can be anything you want
	// Each entry needs at least urn and position
	// If items don't show up, try setting isMale: true
	// Avatars default to using female base shape

	"item0": {
		position: Vector3.create(2.5, 13.32, 0.39),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale   : Vector3.create(1.5, 1.5, 1.5),
		isMale  : true,
		showAvatar: true,
		urn     : "urn:decentraland:matic:collections-v2:0xed0c8eaf9d0a04a24701a90da2580da9cf46fb45:6:631873750011343120187508166102022593913370572403294667525865865222"
	},
	//Shoes
	"bearSlipper": {
		position: Vector3.create(2.5, 0.75, 13.32),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0),
		urn     : "urn:decentraland:off-chain:base-avatars:bear_slippers",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	"dclmf23Sneakers": {
		position: Vector3.create(2.5, 0.75, 15),
		rotation: Quaternion.fromEulerDegrees(0, 45, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xc43914be599f3f8fe4956aa3ec9d6a6aead1edfa:2",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	"dokiFluffyHeels": {
		position: Vector3.create(2.5, 0.75, 17),
		rotation: Quaternion.fromEulerDegrees(0, 135, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x48b0d5544dc0d9bac7507cc65dc7e7f63814222c:0",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	"voguSneakers": {
		position: Vector3.create(2.5, 0.75, 18.65),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x705652b66a12dcf782b0b3d5673fbf0c1797eba2:0",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	"lpmSneakers": {
		position: Vector3.create(2.5, 2.5, 13.32),
		rotation: Quaternion.fromEulerDegrees(0, 135, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xca520eea5aadff51b48d9e9b3038001a751139ca:0",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	"pinkPuffys": {
		position: Vector3.create(2.5, 2.5, 15.15),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xb5af3361822feaeca686341d8ac0b6904a109fd5:1",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	"docBlackSneakers": {
		position: Vector3.create(2.5, 2.5, 16.8),
		rotation: Quaternion.fromEulerDegrees(0, 45, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xd628f631c9fde20a87ae840fabe67048bbd2c1bd:0",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	"dclgx24Boots": {
		position: Vector3.create(2.5, 2.5, 18.7),
		rotation: Quaternion.fromEulerDegrees(0, 45, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x0ae365f8acc27f2c95fc7d60cf49a74f3af21573:2",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	"emmCosmicHeels": {
		position: Vector3.create(2.5, 4.25, 13.32),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x5ea0156772b0ba8887ec2704a2629c2209dd00bf:0",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	"dokiSparkleHeels": {
		position: Vector3.create(2.5, 4.25, 15.15),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x38414c55d46bc48c7e5c2a6f49da664595ec8bc1:3",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	"wzWizardBoots": {
		position: Vector3.create(2.5, 4.25, 17),
		rotation: Quaternion.fromEulerDegrees(0, 135, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xfb8f85195aa9412918366a2d8a6e6ad02f22b9e3:9",
		scale   : Vector3.create(2, 2, 2)
	},
	"fabeoSneakers": {
		position: Vector3.create(2.5, 4.25, 18.7),
		rotation: Quaternion.fromEulerDegrees(0, 45, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x788c89a7f002b7859214217ebb14401295a6520a:0",
		scale   : Vector3.create(2.5, 2.5, 2.5)
	},
	//Outfits
	"dcUniqueOutfit1": {
		position: Vector3.create(3, 0, 21.3),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x023a73d1cf10ed196f39700312a498b27c36e88e:1",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"dcUniqueOutfit2": {
		position: Vector3.create(3, 0, 24.8),
		rotation: Quaternion.fromEulerDegrees(0, 90, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x023a73d1cf10ed196f39700312a498b27c36e88e:0",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"nounSweatsuit": {
		position: Vector3.create(7.1, 0, 28.5),
		rotation: Quaternion.fromEulerDegrees(0, 180, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xeee7a4b2cde1472f9016fab0f4e5b0b97b8de8e1:1",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"fuegoDigitalDress": {
		position: Vector3.create(10.65, 0, 28.5),
		rotation: Quaternion.fromEulerDegrees(0, 180, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x477b341708ac7baa2739b5eb7fee34e8a0986abe:0",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	//Upper-Bodys
	"dclExoJacket": {
		position: Vector3.create(22.1, -0.75, 29),
		rotation: Quaternion.fromEulerDegrees(0, 205, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x8c66d42e8425b2f7affe036e89563d426b78d1d5:0",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"dgVest": {
		position: Vector3.create(24.25, -0.75, 27.75),
		rotation: Quaternion.fromEulerDegrees(0, 215, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x8305e6782cc4285a2fab24cc9aa11eb240a29c5a:5",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"dgJacket": {
		position: Vector3.create(26.1, -0.65, 26.1),
		rotation: Quaternion.fromEulerDegrees(0, 225, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x8305e6782cc4285a2fab24cc9aa11eb240a29c5a:8",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"doritosSweater": {
		position: Vector3.create(27.75, -0.65, 24.15),
		rotation: Quaternion.fromEulerDegrees(0, 235, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xe79cadd6fb15a626a48d2bbb60d4450eb196c84d:5",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"wzSugarVest": {
		position: Vector3.create(28.9, -0.65, 22),
		rotation: Quaternion.fromEulerDegrees(0, 245, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x324cb2c654be51c6ad6c76a3e022cabe49cc4e46:0",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"dokiPeachCrop": {
		position: Vector3.create(22.1, 0.5, 29),
		rotation: Quaternion.fromEulerDegrees(0, 205, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x302dd98d9ca9954df96d43d5cbbae52ae360b0a0:0",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"nounTee": {
		position: Vector3.create(24.25, 0.75, 27.75),
		rotation: Quaternion.fromEulerDegrees(0, 215, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xc5a88e6546d85a64b5c87e9f58a8808c04a185d6:2",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"gorlTop": {
		position: Vector3.create(26.1, 0.75, 26.1),
		rotation: Quaternion.fromEulerDegrees(0, 225, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xf05e461eac1f54cd62c3059bcb56016cb9a47ac8:0",
		isMale:true,
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"chenpengGreenJacket": {
		position: Vector3.create(27.75, 0.75, 24.15),
		rotation: Quaternion.fromEulerDegrees(0, 235, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xba7f33d73aa04b81cbee3f2ecf95f5d442939d0e:2",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	"voguCrop": {
		position: Vector3.create(28.9, 0.75, 22),
		rotation: Quaternion.fromEulerDegrees(0, 245, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x705652b66a12dcf782b0b3d5673fbf0c1797eba2:6",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},
	//Lower-Bodys
	"gcUbnPants": {
		position: Vector3.create(28, -0.2, 18.65),
		rotation: Quaternion.fromEulerDegrees(0, 290, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x688e5c0e65823ddf4a92dcf171b56cb476f22cbd:17",
		scale   : Vector3.create(2, 2, 2)
	},
	"dclPridePants": {
		position: Vector3.create(28, 2.5, 18.65),
		rotation: Quaternion.fromEulerDegrees(0, 290, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xc73b75640bac8bced8829d07aa57e694b446b3f9:5",
		scale   : Vector3.create(2, 2, 2)
	},
	"darkoChickenPants": {
		position: Vector3.create(28, 2.7, 13.3),
		rotation: Quaternion.fromEulerDegrees(0, 245, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x9acb1586b890795d8ce8dcb7ecee250d469f14c0:1",
		scale   : Vector3.create(1.8, 1.8, 1.8)
	},
	"darkoChickenPants2": {
		position: Vector3.create(28, -0.2, 13.3),
		rotation: Quaternion.fromEulerDegrees(0, 245, 0),
		urn     : "urn:decentraland:matic:collections-v2:0x574a56013d8bb09795f3d2b32e2b7b9d9949d22b:1",
		scale   : Vector3.create(2, 2, 2)
	},
	//Heads
	"dokiDollFace1": {
		position: Vector3.create(28.9, -0.65, 10),
		rotation: Quaternion.fromEulerDegrees(0, 300, 0),
		urn     : "urn:decentraland:matic:collections-v2:0xc16f10cce8ee32c2aa91b5b6ceeb099fc8a78aff:0",
		scale   : Vector3.create(1.5, 1.5, 1.5)
	},

}


