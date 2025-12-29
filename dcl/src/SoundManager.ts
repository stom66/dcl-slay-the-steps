import { AudioSource, engine, Entity, Transform } from "@dcl/sdk/ecs"

class SoundManager {
	private bgm_src = "assets/sfx/bgm.mp3"
	bgm?: Entity
	
	private fadingOut    = false
	private fadingIn     = false
	private fadeElapsed  = 0
	private fadeDuration = 3.0
	private volume       = 0.5
	
	constructor() {
		engine.addSystem(this.update)
	}
	
	init() {
		this.bgm = engine.addEntity()
		Transform.create(this.bgm, {})
		AudioSource.create(this.bgm, {
			audioClipUrl: this.bgm_src,
			playing: false,
			global: true,
			volume: 0.5,
		})
	}
	
	StartBGM() {
		if (!this.bgm) return

		const audio = AudioSource.getMutableOrNull(this.bgm)
		if (!audio) return
		if (audio.playing) return

		this.fadingIn = true
		this.fadeElapsed = 0
		audio.volume = 0
		audio.playing = true
	}
	
	StopBGM() {
		if (!this.bgm) return
		
		const audio = AudioSource.getMutableOrNull(this.bgm)
		if (!audio) return
		if (!audio.playing) return
		
		this.fadingOut = true
		this.fadeElapsed = 0
		this.volume = audio.volume ?? 0.5
	}
	
	private update = (dt: number) => {
		if (!(this.fadingOut || this.fadingIn) || !this.bgm) return
		
		const audio = AudioSource.getMutableOrNull(this.bgm)
		if (!audio) return
		this.fadeElapsed += dt
		
		if (this.fadeElapsed >= this.fadeDuration) {
			if (this.fadingOut) {
				audio.volume = 0
				audio.playing = false
				this.fadingOut = false
			} else {
				audio.volume = this.volume
				this.fadingIn = false
			}
		} else {
			if (this.fadingOut) {
				audio.volume = Math.max(
					0,
					this.volume * (1 - this.fadeElapsed / this.fadeDuration)
				)
			} else {
				audio.volume = Math.min(
					1,
					this.volume * (this.fadeElapsed / this.fadeDuration)
				)
			}
		}
	}
}

export const _SoundManager = new SoundManager()
