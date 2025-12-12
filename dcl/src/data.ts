// MARK: Config Options
export const rarityValues: Record<string, number> = {
	common   : 1,
	uncommon : 2,
	rare     : 3,
	epic     : 4,
	legendary: 5,
	exotic   : 6,
	mythic   : 7,
	unique   : 8
}


// Array of multiplier icons
export const multIcons: string[] = [
	"images/multiplier-1.png",
	"images/multiplier-1.5.png",
	"images/multiplier-2.png",
	"images/multiplier-2.5.png",
	"images/multiplier-3.png",
	"images/multiplier-3.5.png",
	"images/multiplier-4.png",
	"images/multiplier-4.5.png",
]


export const multValues: number[] = [
	1, 1.5, 2, 2.5,
	3, 3.5, 4, 4.5
]

export const ignoreWearableCategories: Record<string, boolean> = {
	mouth   : true,
	eyes    : true,
	eyebrows: true,
} 