import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'
import { engine } from '@dcl/sdk/ecs'

var visibleLoading: boolean = true

export function HideLoading() {
	visibleLoading = false
}

export function LoadingUI() {
  return (
    <UiEntity
      key={`ui_Loading_root`}
      uiTransform={{
        width         : '100%',
        height        : '100%',
        flexDirection : 'column',
        alignItems    : 'center',
        justifyContent: 'center',
		display       : visibleLoading ? 'flex' : 'none',
      }}
    >
      
      {/* Background */}
      <UiEntity
        key={`ui_Loading_bg`}
        uiTransform={{
          width        : '100%',
          height       : '100%',
          positionType : "absolute",
          position     : { top: 0, left: 0 },
        }}
        uiBackground={{
          texture: {
            src: "assets/images/ui/ui-loading.png"
          },
          textureMode: "stretch",
        }}
      />
    </UiEntity>
  )
}