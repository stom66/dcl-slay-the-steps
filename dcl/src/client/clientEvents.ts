// List of all client events used by the eventBus for inter-script communication
export enum ClientEvents {
	NOTIFY_EMOTE    = "notifyEmote",
	NOTIFY_STATE    = "notifyState",
	NOTIFY_WARNING  = "notifyWarning",
	OUTFIT_CHANGED  = "outfitChanged",
	PLAYERS_UPDATED = "playersUpdated",
}
