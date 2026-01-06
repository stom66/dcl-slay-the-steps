### Things ToDo

- [ ] Make a logo
- [ ] Add UI "GameStatus" panel
- [ ] Add a "theme" for each round
- [ ] Add a ShopZone for "specials" - could replace outfits
- [ ] Add
- [x] Create scene thumbnail
- [x] Add UI hint to encourage contestants to emote during their turn
- [x] When a game is starting, host should broadcast it's status every second
- [x] Revise the How To Play ui
- [x] reset zone items to defaults if user goes back to the first page
- [x] Playerlist: highlight the current player?
- [?] Implement TryOn feature
- [x] Lock players to seats when they're in the game
- [x] Dress the GameHost NPC
- [x] ensure updates come from current host
- [x] add timestamps to updates and ignore old ones
- [x] Timer doesn't hide for players who didn't enter the game
- [x] add an option to reset the player characters outfit to what they're currently wearing
- [x] if a user equips an outfit, it should remove their upperBody, lowerBody, shoes, hair
- [x] add collider to center circle podium thing
- [x] Timer showing wrong values for players in different time zones
- [x] Ensure max player count works
- [x] Sync player emotes to the NPCs
- [x] Populate shelves with wearables
- [x] Add music
- [x] moveToLobby should spawn players somewhere in the center circle
- [x] Add in-world UI "How to Play" above the NPCGameHost
- 

### Requested features

- [ ] Page numbers for ShopZones


### Stretch

- [ ] add a portrait of the player above the catwalk
- [ ] Add a light which follows the player, offset above, clamped to the bounds of the circle in the lobby
- [x] Allow gender-swapping avatar

### Bug list:

- [x] Teleport at round end not working? Seems to be the game crashing at the round end. Suspect Camera.
- [x] Ensure mannequin is hidden at start of round
- [x] NPCs not getting cleaned up after a round
- [x] Spawning an avatar with bodyShape: "BaseFemale" causes the wearables to not show up
- [x] Timer goes to -1
- [x] Results show vote for winner title

### SDK bugs

- [ ] Can we stop the avatar from running when they move?
- [ ] AvatarTexture showing the same icon for every player/wrong player
- [ ] fetch timeout property is ignored
- [ ] OnTriggerExit doesn't fire reliably
	- stil not reliable after updating dependencies

## Playtest notes

Results of the playtest withe Bay, Virgina and Ludmi:

- [x] draw player attention to the navigation buttons - not noticed at first
- [x] try updating the sdk verison to fix the issue with the trigger zones
- [x] try moving the virtual camera back to the player before removing it
- [x] still crashing 