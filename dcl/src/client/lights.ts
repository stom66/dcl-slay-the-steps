import { engine, LightSource, Material, Transform } from "@dcl/sdk/ecs"
import { Color3, Quaternion, Vector3 } from "@dcl/sdk/math"

export const SetupLights = () => {
	// Spawn some lights

	// MARK: Downstairs Main
/* 	const lightDownstairs = engine.addEntity()
	Transform.create(lightDownstairs, {
		position: Vector3.create(16, 3, 16),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale: Vector3.create(1, 1, 1)
	})
	LightSource.create(lightDownstairs, {
		type     : LightSource.Type.Point({}),
		intensity: 150000,
		//shadow   : false,
		//color    : Color3.White(),
		//active   : true,
		shadowMaskTexture: Material.Texture.Common({src: "images/light-mask.png"})         
	}) */

	// MARK: Downstairs Booth
	const lightDownstairsBooth = engine.addEntity()
	Transform.create(lightDownstairsBooth, {
		position: Vector3.create(9, 6, 23),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale: Vector3.create(10, 10, 10)
	})
	LightSource.create(lightDownstairsBooth, {
		type     : LightSource.Type.Point({}),
		intensity: 50000,
		shadow   : true,
		color    : Color3.Yellow(),
		active   : true
	})



	// MARK: Upstairs Main
/* 	const lightUpstairs = engine.addEntity()
	Transform.create(lightUpstairs, {
		position: Vector3.create(16, 18, 16),
		rotation: Quaternion.fromEulerDegrees(0, 0, 0),
		scale: Vector3.create(1, 1, 1)
	})
	LightSource.create(lightUpstairs, {
		type     : LightSource.Type.Point({}),
		intensity: 150000,
		shadow   : false,
		color    : Color3.White(),
		active   : true
	}) */


	// Spotlight at top of stairs
	const lightStairsTop = engine.addEntity()
	Transform.create(lightStairsTop, {
		position: Vector3.create(16, 21.1, 29.25),
		rotation: Quaternion.fromEulerDegrees(90, 0, 0),
		scale: Vector3.create(1, 1, 1)
	})
	LightSource.create(lightStairsTop, {
		type     : LightSource.Type.Spot({ innerAngle: 25, outerAngle: 45 }),
		intensity: 150000,
		shadow   : true,
		color    : Color3.Yellow(),
		active   : true
	})


	// Spotlight above GameHost
	const spotlightGameHost = engine.addEntity()
	Transform.create(spotlightGameHost, {
		position: Vector3.create(16, 9, 16),
		rotation: Quaternion.fromEulerDegrees(90, 0, 0),
		scale: Vector3.create(1, 1, 1)
	})
	LightSource.create(spotlightGameHost, {
		type     : LightSource.Type.Spot({ innerAngle: 25, outerAngle: 65 }),
		intensity: 500000,
		shadow   : true,
		color    : Color3.fromHexString('#ACBB68'),
		active   : true
	})


	

}