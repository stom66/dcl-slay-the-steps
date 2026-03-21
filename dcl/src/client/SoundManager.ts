import { AudioSource, engine, Entity, Transform } from "@dcl/sdk/ecs"

export namespace SoundManager {
	const bgm_src = "assets/sfx/bgm.mp3"
	let bgm: Entity
	
	const fadeDuration = 3.0
	let fadingOut    = false
	let fadingIn     = false
	let fadeElapsed  = 0
	let volume       = 0.5
	
	
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
	}
	
	export function StartBGM() {
		if (!bgm) return

		const audio = AudioSource.getMutableOrNull(bgm)
		if (!audio) return
		if (audio.playing) return

		fadingIn = true
		fadeElapsed = 0
		audio.volume = 0
		audio.playing = true
	}
	
	export function StopBGM() {
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
