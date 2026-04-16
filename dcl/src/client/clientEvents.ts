// List of all client events used by the eventBus for inter-script communication
export enum ClientEvents {
	NOTIFY_EMOTE              = "notifyEmote",
	NOTIFY_STATE              = "notifyState",
	NOTIFY_TURN_STARTING_SOON = "notifyTurnStartingSoon",
	NOTIFY_TURN_STARTING      = "notifyTurnStarting",
	NOTIFY_WARNING            = "notifyWarning",
	OUTFIT_CHANGED            = "outfitChanged",
	PLAYERS_UPDATED           = "playersUpdated",
	JOIN_AS_SPECTATOR         = "joinAsSpectator",
	SHOW_DRESS_ME_HINT        = "showDressMeHint",
}
