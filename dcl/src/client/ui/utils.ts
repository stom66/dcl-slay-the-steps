import { engine } from "@dcl/sdk/ecs"

// MARK: Helpers
export function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t
}

export function tweenValue(
	from: number,
	to: number,
	duration: number,
	onUpdate: (v: number) => void,
	onComplete?: () => void
) {
	let elapsed = 0

	function system(dt: number) {
		elapsed += dt
		const t = Math.min(elapsed / duration, 1)
		onUpdate(lerp(from, to, t))

		if (t >= 1) {
			onUpdate(to)
			engine.removeSystem(system)
			onComplete?.()
		}
	}

	engine.addSystem(system)
}