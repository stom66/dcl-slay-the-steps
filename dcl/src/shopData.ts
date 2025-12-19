import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math";

export type ShopSlot = {
	position   : Vector3
	defaultUrn : string,
	rotation?  : Quaternion,
	scale?     : Vector3,
	isMale?    : boolean,
	showAvatar?: boolean,
	eyeColor?  : Color3,
	skinColor? : Color3,
	hairColor? : Color3
}

// Big list of the items to be shown in the shop
export const shopData: Record<string, ShopSlot> = {

	// Each entry needs a unique key (item0, item1 etc) but it can be anything you want
	// Each entry needs at least urn and position
	// If items don't show up, try setting isMale: true
	// Avatars default to using female base shape


	// MARK: Shoes
	// Layout:
	// | 12 | 13 | 14 | 15 |
	// | 8  | 9  | 10 | 11 |
	// | 4  | 5  | 6  | 7  |
	// | 0  | 1  | 2  | 3  |                                  

	"shoes_0": {
		position  : Vector3.create(2.5, 0.75, 13.32),
		rotation  : Quaternion.fromEulerDegrees(0, 90, 0),
		defaultUrn: "urn:decentraland:off-chain:base-avatars:bear_slippers",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_1": {
		position  : Vector3.create(2.5, 0.75, 15),
		rotation  : Quaternion.fromEulerDegrees(0, 45, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xc43914be599f3f8fe4956aa3ec9d6a6aead1edfa:2",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_2": {
		position  : Vector3.create(2.5, 0.75, 17),
		rotation  : Quaternion.fromEulerDegrees(0, 135, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x48b0d5544dc0d9bac7507cc65dc7e7f63814222c:0",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_3": {
		position  : Vector3.create(2.5, 0.75, 18.65),
		rotation  : Quaternion.fromEulerDegrees(0, 90, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x705652b66a12dcf782b0b3d5673fbf0c1797eba2:0",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_4": {
		position  : Vector3.create(2.5, 2.5, 13.32),
		rotation  : Quaternion.fromEulerDegrees(0, 135, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xca520eea5aadff51b48d9e9b3038001a751139ca:0",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_5": {
		position  : Vector3.create(2.5, 2.5, 15.15),
		rotation  : Quaternion.fromEulerDegrees(0, 90, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xb5af3361822feaeca686341d8ac0b6904a109fd5:1",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_6": {
		position  : Vector3.create(2.5, 2.5, 16.8),
		rotation  : Quaternion.fromEulerDegrees(0, 45, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xd628f631c9fde20a87ae840fabe67048bbd2c1bd:0",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_7": {
		position  : Vector3.create(2.5, 2.5, 18.7),
		rotation  : Quaternion.fromEulerDegrees(0, 45, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x0ae365f8acc27f2c95fc7d60cf49a74f3af21573:2",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_8": {
		position  : Vector3.create(2.5, 4.25, 13.32),
		rotation  : Quaternion.fromEulerDegrees(0, 90, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x5ea0156772b0ba8887ec2704a2629c2209dd00bf:0",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_9": {
		position  : Vector3.create(2.5, 4.25, 15.15),
		rotation  : Quaternion.fromEulerDegrees(0, 90, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x38414c55d46bc48c7e5c2a6f49da664595ec8bc1:3",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_10": {
		position  : Vector3.create(2.5, 4.25, 17),
		rotation  : Quaternion.fromEulerDegrees(0, 135, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xfb8f85195aa9412918366a2d8a6e6ad02f22b9e3:9",
		scale     : Vector3.create(2, 2, 2)
	},
	"shoes_11": {
		position  : Vector3.create(2.5, 4.25, 18.7),
		rotation  : Quaternion.fromEulerDegrees(0, 45, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x788c89a7f002b7859214217ebb14401295a6520a:0",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
/* 	"shoes_12": {
		position  : Vector3.create(2.5, 6, 13.32),
		rotation  : Quaternion.fromEulerDegrees(0, 90, 0),
		defaultUrn: "urn:",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_13": {
		position  : Vector3.create(2.5, 6, 15.15),
		rotation  : Quaternion.fromEulerDegrees(0, 90, 0),
		defaultUrn: "urn:",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	},
	"shoes_14": {
		position  : Vector3.create(2.5, 6, 17),
		rotation  : Quaternion.fromEulerDegrees(0, 135, 0),
		defaultUrn: "urn:",
		scale     : Vector3.create(2, 2, 2)
	},
	"shoes_15": {
		position  : Vector3.create(2.5, 6, 18.7),
		rotation  : Quaternion.fromEulerDegrees(0, 45, 0),
		defaultUrn: "urn:",
		scale     : Vector3.create(2.5, 2.5, 2.5)
	}, */


	//MARK: Outfits
	// Layout: 0-3, left to right

	"outfit_0": {
		position  : Vector3.create(3, 0, 21.3),
		rotation  : Quaternion.fromEulerDegrees(0, 90, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x023a73d1cf10ed196f39700312a498b27c36e88e:1",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"outfit_1": {
		position  : Vector3.create(3, 0, 24.8),
		rotation  : Quaternion.fromEulerDegrees(0, 90, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x023a73d1cf10ed196f39700312a498b27c36e88e:0",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"outfit_2": {
		position  : Vector3.create(7.1, 0, 28.5),
		rotation  : Quaternion.fromEulerDegrees(0, 180, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xeee7a4b2cde1472f9016fab0f4e5b0b97b8de8e1:1",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"outfit_3": {
		position  : Vector3.create(10.65, 0, 28.5),
		rotation  : Quaternion.fromEulerDegrees(0, 180, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x477b341708ac7baa2739b5eb7fee34e8a0986abe:0",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},


	//MARK: Upper-Bodys
	// Layout:
	// | 5  | 6  | 7  | 8  | 9
	// | 0  | 1  | 2  | 3  | 4
	
	"upperBody_0": {
		position  : Vector3.create(22.1, -0.75, 29),
		rotation  : Quaternion.fromEulerDegrees(0, 205, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x8c66d42e8425b2f7affe036e89563d426b78d1d5:0",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"upperBody_1": {
		position  : Vector3.create(24.25, -0.65, 27.75),
		rotation  : Quaternion.fromEulerDegrees(0, 215, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xf61d27b7899d2641b02c56f4617f2d01f63f7ee5:1",
		scale     : Vector3.create(1.5, 1.5, 1.5),
	},
	"upperBody_2": {
		position  : Vector3.create(26.1, -0.65, 26.1),
		rotation  : Quaternion.fromEulerDegrees(0, 225, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x8305e6782cc4285a2fab24cc9aa11eb240a29c5a:8",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"upperBody_3": {
		position  : Vector3.create(27.75, -0.65, 24.15),
		rotation  : Quaternion.fromEulerDegrees(0, 235, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xe79cadd6fb15a626a48d2bbb60d4450eb196c84d:5",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"upperBody_4": {
		position  : Vector3.create(28.9, -0.65, 22),
		rotation  : Quaternion.fromEulerDegrees(0, 245, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x324cb2c654be51c6ad6c76a3e022cabe49cc4e46:0",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"upperBody_5": {
		position  : Vector3.create(22.1, 0.5, 29),
		rotation  : Quaternion.fromEulerDegrees(0, 205, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x302dd98d9ca9954df96d43d5cbbae52ae360b0a0:0",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"upperBody_6": {
		position  : Vector3.create(24.25, 0.75, 27.75),
		rotation  : Quaternion.fromEulerDegrees(0, 215, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xc5a88e6546d85a64b5c87e9f58a8808c04a185d6:2",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"upperBody_7": {
		position  : Vector3.create(26.1, 0.75, 26.1),
		rotation  : Quaternion.fromEulerDegrees(0, 225, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xf05e461eac1f54cd62c3059bcb56016cb9a47ac8:0",
		isMale    : true,
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"upperBody_8": {
		position  : Vector3.create(27.75, 0.75, 24.15),
		rotation  : Quaternion.fromEulerDegrees(0, 235, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xba7f33d73aa04b81cbee3f2ecf95f5d442939d0e:2",
		scale     : Vector3.create(1.5, 1.5, 1.5)
	},
	"upperBody_9": {
		position  : Vector3.create(28.9, 0.75, 22),
		rotation  : Quaternion.fromEulerDegrees(0, 245, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x705652b66a12dcf782b0b3d5673fbf0c1797eba2:6",
		scale     : Vector3.create(1.5, 1.5, 1.5),
	},



	//MARK: Lower-Bodys
	// Layout:
	// | 2 | 3
	// | 0 | 1
	"lowerBody_0": {
		position  : Vector3.create(28, -0.2, 18.65),
		rotation  : Quaternion.fromEulerDegrees(0, 290, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x688e5c0e65823ddf4a92dcf171b56cb476f22cbd:17",
		scale     : Vector3.create(2, 2, 2)
	},
	"lowerBody_1": {
		position  : Vector3.create(28, -0.2, 13.3),
		rotation  : Quaternion.fromEulerDegrees(0, 245, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x574a56013d8bb09795f3d2b32e2b7b9d9949d22b:1",
		scale     : Vector3.create(2, 2, 2)
	},
	"lowerBody_2": {
		position  : Vector3.create(28, 2.5, 18.65),
		rotation  : Quaternion.fromEulerDegrees(0, 290, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xc73b75640bac8bced8829d07aa57e694b446b3f9:5",
		scale     : Vector3.create(2, 2, 2)
	},
	"lowerBody_3": {
		position  : Vector3.create(28, 2.7, 13.3),
		rotation  : Quaternion.fromEulerDegrees(0, 245, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x9acb1586b890795d8ce8dcb7ecee250d469f14c0:1",
		scale     : Vector3.create(1.8, 1.8, 1.8)
	},


	//MARK: Heads
	// Layout:
	// | 0 | 1 | 2 | 3 | 4 |
	// | 5 | 6 | 7 | 8 | 9 |

	"head_0": {
		position: Vector3.create(29.1, -2, 9.9),
		rotation  : Quaternion.fromEulerDegrees(0, 290, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xc16f10cce8ee32c2aa91b5b6ceeb099fc8a78aff:0",
		scale     : Vector3.create(2,2,2),
		showAvatar: true,
		skinColor: Color3.fromHexString("#FFE4C6"),
	},
	"head_1": {
		position: Vector3.create(27.8, -2, 7.8),
		rotation  : Quaternion.fromEulerDegrees(0, 300, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xc7dddcd8e3818c224d9cd548481a250061e38e02:0",
		scale     : Vector3.create(2,2,2),
		showAvatar: true,
		skinColor: Color3.fromHexString("#F2C2A5"),
	},
	"head_2": {
	   position: Vector3.create(26.1, -2, 5.84),
	   rotation  : Quaternion.fromEulerDegrees(0, 310, 0),
	   defaultUrn: "urn:decentraland:matic:collections-v2:0x736e227684be1e65e15f8a2de2709fcc284a8b13:0",
	   scale     : Vector3.create(2,2,2),
	   showAvatar: true,
	   isMale: true,
	   skinColor : Color3.fromHexString("#CC9B77"),
   	},
	"head_3": {
		position: Vector3.create(24.25, -2, 4.24),
		rotation  : Quaternion.fromEulerDegrees(0, 320, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x11cfe2f76627f8d22fd7eca8fec7e58820bcacc8:0",
		scale     : Vector3.create(2,2,2),
		showAvatar: true,
		skinColor: Color3.fromHexString("#7D5D47"),
	},
	"head_4": {
		position:  Vector3.create(22.15, -2, 2.9),
		rotation  : Quaternion.fromEulerDegrees(0, 330, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x90f3d8780f8e32c0f1f937edfc0ad930b2e7347f:0",
		scale     : Vector3.create(2,2,2),
		showAvatar: true,
		skinColor: Color3.fromHexString("#522C1C"),
	},
	//jewelry
	"head_5": {
		position: Vector3.create(29.1, -3.75, 9.9),
		rotation  : Quaternion.fromEulerDegrees(0, 290, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xea5fa934cb38cf3abb28190fad15c9dd4a0c90e8:0",
		scale     : Vector3.create(4,4,4),
	},
	"head_6": {
		position: Vector3.create(27.8, -3.75, 7.8),
		rotation  : Quaternion.fromEulerDegrees(0, 300, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xd9b512b6e2023ed6217daad3dff66c99b5929439:1",
		scale     : Vector3.create(4,4,4),
	},
	"head_7": {
	   position: Vector3.create(26.1, -3.75, 5.84),
	   rotation  : Quaternion.fromEulerDegrees(0, 310, 0),
	   defaultUrn: "urn:decentraland:matic:collections-v2:0x81a1e00cc33b5ae2405c54cc906e894de8174683:1",
	   scale     : Vector3.create(4,4,4),
   	},
	"head_8": {
		position: Vector3.create(24.25, -3.75, 4.24),
		rotation  : Quaternion.fromEulerDegrees(0, 320, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x956b8d57066fc3d2562de22efd63624a1ba56e35:19",
		scale     : Vector3.create(4,4,4),
	},
	"head_9": {
		position:  Vector3.create(22.15, -3.75, 2.9),
		rotation  : Quaternion.fromEulerDegrees(0, 330, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xc73b75640bac8bced8829d07aa57e694b446b3f9:4",
		scale     : Vector3.create(4,4,4),
	},
	//MARK: Hairs
	// Layout:
	// | 0 | 1 | 2 | 3 |
	"hair_0": {
		position:  Vector3.create(6.114, 0, 3.202),
		rotation  : Quaternion.fromEulerDegrees(0, 45, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x451c3eee518bee14baf0df6bd06639959d5815a8:0",
		scale     : Vector3.create(1,1,1),
		hairColor : Color3.fromHexString("#e6cd7a"),
		showAvatar : true,
	},
	"hair_1": {
		position:  Vector3.create(5.119, 0, 4.197),
		rotation  : Quaternion.fromEulerDegrees(0, 45, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x8103ed8b1140189a2703760fda37063d5f8259f3:0",
		scale     : Vector3.create(1,1,1),
		hairColor : Color3.fromHexString("#000000"),
		showAvatar : true,
		isMale : true,
	},
	"hair_2": {
		position:  Vector3.create(4.124, 0, 5.192),
		rotation  : Quaternion.fromEulerDegrees(0, 45, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0x0c36f67f9d0601c040b0429790688ac231ae9ef0:1",
		scale     : Vector3.create(1,1,1),
		hairColor : Color3.fromHexString("#49dedb"),
		showAvatar : true,
		isMale : true,
	},
	"hair_3": {
		position:  Vector3.create(3.129, 0, 6.187),
		rotation  : Quaternion.fromEulerDegrees(0, 45, 0),
		defaultUrn: "urn:decentraland:matic:collections-v2:0xd70a2c52cfb19403bcbf6e59a26364b30a853477:1",
		scale     : Vector3.create(1,1,1),
		hairColor : Color3.fromHexString("#e93838"),
		showAvatar : true,
	},

}



