import { AudioSource, engine, Entity, Transform } from "@dcl/sdk/ecs"
import * as utils from '@dcl-sdk/utils'

import { GameStatus } from 'src/shared/enums'
import { ClientState, NotifyStatePayload } from 'src/shared/types'
import { eventBus } from 'src/shared/utils/eventBus'

import { ClientEvents } from 'src/client/clientEvents'
import { sfx } from 'src/client/data/sfx'


export namespace SoundManager {
	const bgm_src = "assets/sfx/bgm.mp3"
	let bgm: Entity
	
	const fadeDuration = 3.0
	let fadingOut    = false
	let fadingIn     = false
	let fadeElapsed  = 0
	let volume       = 0.5

	var lastPlayedSfx: string | undefined = undefined
	var sfxCache: Record<string, Entity> = {}	

	// Start the music when the game starts
	eventBus.on(ClientEvents.NOTIFY_STATE, (data: ClientState) => {
		if (data.serverStatus == GameStatus.STARTED) {
			StartBGM()
		}
		if (data.serverStatus == GameStatus.LOBBY) {
			StopBGM()
		}
	})

	eventBus.on(ClientEvents.NOTIFY_ABORT_GAME, (data) => {
		StopBGM()
	})
	
	
	export function init() {
		engine.addSystem(System_UpdateSound)
		bgm = engine.addEntity()
		Transform.create(bgm, {})
		AudioSource.create(bgm, {
			audioClipUrl: bgm_src,
			playing: false,
			global: true,
			volume: 0.5,
		})

		preloadSfx()
	}

	function preloadSfx() {
		for (const paths of Object.values(sfx)) {
			for (const soundPath of paths) {
				const soundEntity = engine.addEntity()
				Transform.create(soundEntity, {})
				AudioSource.create(soundEntity, {
					audioClipUrl: soundPath,
					playing: false,
					global: true,
					volume: 0.5,
				})
				sfxCache[soundPath] = soundEntity
			}
		}
	}

	export function PlaySound(sound: string | string[]) {
		if (typeof sound === 'string') {
			sound = [sound]
		}

		// Choose a random sound, but allow repeating if there's only one option
		let randomSound: string;
		if (sound.length === 1) {
			randomSound = sound[0];
		} else {
			do {
				randomSound = sound[Math.floor(Math.random() * sound.length)];
			} while (randomSound === lastPlayedSfx && sound.length > 1);
		}
		lastPlayedSfx = randomSound;

		console.log("SoundManager: PlaySound: playing sound", randomSound);
		const soundEntity = sfxCache[randomSound];
		if (!soundEntity) {
			console.error("SoundManager: PlaySound: sound entity not found", randomSound);
			return;
		}
		const audioSrc = AudioSource.getMutable(soundEntity);
		if (!audioSrc) {
			console.error("SoundManager: PlaySound: audio source not found", randomSound);
			return;
		}

		// Always retrigger the sound by toggling `playing` off and on in the next tick
		audioSrc.playing = false;
		audioSrc.currentTime = 0;

		// Use a small timeout to ensure the audio system resets (works around retrigger issues)
		// Sometimes setting playing=false then =true immediately does not retrigger, so do it on next frame
		setTimeout(() => {
			const audio = AudioSource.getMutable(soundEntity);
			if (audio) {
				audio.playing = true;
			}
		}, 0);
	}

	
	function StartBGM() {
		if (!bgm) return

		const audio = AudioSource.getMutableOrNull(bgm)
		if (!audio) return
		if (audio.playing) return

		fadingIn = true
		fadeElapsed = 0
		audio.volume = 0
		audio.playing = true
	}
	
	function StopBGM() {
		if (!bgm) return
		
		const audio = AudioSource.getMutableOrNull(bgm)
		if (!audio) return
		if (!audio.playing) return
		
		fadingOut = true
		fadeElapsed = 0
		volume = audio.volume ?? 0.5
	}
	
	const System_UpdateSound = (dt: number) => {
		if (!(fadingOut || fadingIn) || !bgm) return
		
		const audio = AudioSource.getMutableOrNull(bgm)
		if (!audio) return
		fadeElapsed += dt
		
		if (fadeElapsed >= fadeDuration) {
			if (fadingOut) {
				audio.volume = 0
				audio.playing = false
				fadingOut = false
			} else {
				audio.volume = volume
				fadingIn = false
			}
		} else {
			if (fadingOut) {
				audio.volume = Math.max(
					0,
					volume * (1 - fadeElapsed / fadeDuration)
				)
			} else {
				audio.volume = Math.min(
					1,
					volume * (fadeElapsed / fadeDuration)
				)
			}
		}
	}
}
