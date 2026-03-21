export type GameState = {
	gameState    : GameStatus,
	hostUserId   : string,
	players      : string[],
	gameStartTime: number,
	votes        : { [key: string]: string },
	timestamp    : number,
	outfits      : Outfit[],
}

export type RequestVote = {
	voteFrom: string,
	voteFor : string,
}
