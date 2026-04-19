
export const MetricEvents = {


	GAME_CREATED              : "gameCreated",             // When a game is created, lists the user who created it
	GAME_STARTED              : "gameStarted",             // When a game starts, lists the users in the game
	GAME_ENDED                : "gameEnded",               // When a game ends, lists the users in the game
	GAME_ABORTED              : "gameAborted",             // When a game is aborted, lists the users in the game
	
	PLAYER_SCENE_JOINED       : "playerJoinedScene",       // When a player joins the scene
	PLAYER_SCENE_LEFT         : "playerLeftScene",         // When a player leaves the scene
	
	PLAYER_TUTORIAL_ABORTED  : "playerTutorialAborted",  // When a player aborts the tutorial
	PLAYER_TUTORIAL_COMPLETED: "playerTutorialCompleted", // When a player completes the tutorial

	PLAYER_EMOTED             : "playerEmoted",            // When a player emotes

	PLAYER_GAME_CREATED       : "playerCreatedGame",       // When a player creates a game
	PLAYER_GAME_JOINED        : "playerJoinedGame",        // When a player joins a game
	PLAYER_GAME_SPECTATED     : "playerSpectatedGame",     // When a player spectates a game
	PLAYER_GAME_WON           : "playerWonGame",           // When a player wins a game
	PLAYER_GAME_NOT_WON       : "playerDidNotWinGame",     // When a player doesn't win a game

	PLAYER_VOTE_CAST          : "playerVoteCast",          // When a player casts a vote

	PLAYER_EQUIPPED_WEARABLE  : "playerEquippedWearable",  // When a player equips a wearable
	PLAYER_EQUIPPED_COLOR_SKIN: "playerEquippedColorSkin", // When a player selects a skin color
	PLAYER_EQUIPPED_COLOR_HAIR: "playerEquippedColorHair", // When a player selects a hair color
} as const

export type MetricEvent = (typeof MetricEvents)[keyof typeof MetricEvents]
