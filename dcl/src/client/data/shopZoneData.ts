import { Quaternion, Vector3 } from "@dcl/sdk/math"
import { Entity } from "@dcl/sdk/ecs"

import { ShopSlot, shopSlots } from "src/client/data/shopSlotData"



export type ShopZone = {
	key              : string
	title            : string
	position         : Vector3
	currentPage      : number,
	entities         : Entity[],
	scale?           : Vector3,
	uiOffset         : Vector3,
	uiRotation       : Quaternion,
	slots            : ShopSlot[],
	wearableCategory?: string | string[]
}


export const shopZones: ShopZone[] = [
	{ // MARK: Shoes
		key             : "shoes",
		title           : "Shoes",
		currentPage     : -1,
		entities        : [],
		wearableCategory: "feet",
		position        : Vector3.create(2.946, 0.249, 16.0),
		scale           : Vector3.create(7.43, 7.43, 7.43),
		uiOffset        : Vector3.create(3.017, 1.951, 16.001),
		uiRotation      : Quaternion.fromEulerDegrees(0, 90.0, 0),
		slots           : [
			shopSlots["shoes_0"],
			shopSlots["shoes_1"],
			shopSlots["shoes_2"],
			shopSlots["shoes_3"],
			shopSlots["shoes_4"],
			shopSlots["shoes_5"],
			shopSlots["shoes_6"],
			shopSlots["shoes_7"],
			shopSlots["shoes_8"],
			shopSlots["shoes_9"],
			shopSlots["shoes_10"],
			shopSlots["shoes_11"],
			//shopData["shoes_12"],
			//shopData["shoes_13"],
			//shopData["shoes_14"],
			//shopData["shoes_15"],
		]
	},
	
/* 	{ // MARK: Outfits
		key             : "outfits",
		title           : "Outfits",
		currentPage     : -1,
		entities        : [],
		wearableCategory: "skin",
		position        : Vector3.create(4.404, 0.1, 27.539),
		scale           : Vector3.create(14.408, 14.408, 14.408),
		uiOffset        : Vector3.create(4.366, 4.078, 27.578),
		uiRotation      : Quaternion.fromEulerDegrees(0, 135.0, 0),
		slots           : [
			shopSlots["outfit_0"],
			shopSlots["outfit_1"],
			shopSlots["outfit_2"],
			shopSlots["outfit_3"],
		]
	}, */
	
	{ // MARK: Upper body
		key             : "upperBody",
		title           : "Upper Body",
		currentPage     : -1,
		entities        : [],
		wearableCategory: "upper_body",
		position        : Vector3.create(27.35, 0.1, 27.5),
		scale           : Vector3.create(14.62, 14.62, 14.62),
		uiOffset        : Vector3.create(25.854, 3.75, 25.809),
		uiRotation      : Quaternion.fromEulerDegrees(0, 225, 0),
		slots           : [
			shopSlots["upperBody_0"],
			shopSlots["upperBody_1"],
			shopSlots["upperBody_2"],
			shopSlots["upperBody_3"],
			shopSlots["upperBody_4"],
			shopSlots["upperBody_5"],
			shopSlots["upperBody_6"],
			shopSlots["upperBody_7"],
			shopSlots["upperBody_8"],
			shopSlots["upperBody_9"],
		]
	},
	
	{ // MARK: Lower body
		key             : "lowerBody",
		title           : "Lower Body",
		currentPage     : -1,
		entities        : [],
		wearableCategory: "lower_body",
		position        : Vector3.create(27.26, 0.1, 16.0),
		scale           : Vector3.create(8.201, 8.201, 8.201),
		uiOffset        : Vector3.create(27.26, 2.488, 16.0),
		uiRotation      : Quaternion.fromEulerDegrees(0, 270, 0),
		slots           : [
			shopSlots["lowerBody_0"],
			shopSlots["lowerBody_1"],
			shopSlots["lowerBody_2"],
			shopSlots["lowerBody_3"],
		]
	},
	
	{ // MARK: Head (Helmets)
		key             : "head",
		title           : "Head",
		currentPage     : -1,
		entities        : [],
		wearableCategory: ["helmet"], // all cats: "head", "eyes", "earring", "helmet", "mask", "top_head", "tiara"
		position        : Vector3.create(27.35, 0.1, 4.5),
		scale           : Vector3.create(14.62, 14.62, 14.62),
		uiOffset        : Vector3.create(25.854, 0.4, 6.191),
		uiRotation      : Quaternion.fromEulerDegrees(0, 315, 0),
		slots           : [
			shopSlots["head_0"],
			shopSlots["head_1"],
			shopSlots["head_2"],
			shopSlots["head_3"],
			shopSlots["head_4"],
		]
	},
	
	{ // MARK: Earrings
		key             : "earrings",
		title           : "Earrings",
		currentPage     : -1,
		entities        : [],
		wearableCategory: ["earring"],
		position        : Vector3.create(27.35, 0.1, 4.5),
		scale           : Vector3.create(14.62, 14.62, 14.62),
		uiOffset        : Vector3.create(25.854, 3.75, 6.191),
		uiRotation      : Quaternion.fromEulerDegrees(0, 315, 0),
		slots           : [
			shopSlots["head_5"],
			shopSlots["head_6"],
			shopSlots["head_7"],
			shopSlots["head_8"],
			shopSlots["head_9"],
		]
	},
	
	{ // MARK: Hair
		key             : "hair",
		title           : "Hair",
		currentPage     : -1,
		entities        : [],
		wearableCategory: ["hair"],
		position        : Vector3.create(5.548, 0.0, 5.636),
		scale           : Vector3.create(7.906, 7.906, 7.906),
		uiOffset        : Vector3.create(3.614, 3.55, 3.702),
		uiRotation      : Quaternion.fromEulerDegrees(0, 45, 0),
		slots           : [
			shopSlots["hair_0"],
			shopSlots["hair_1"],
			shopSlots["hair_2"],
			shopSlots["hair_3"],
		]
	}	
]
