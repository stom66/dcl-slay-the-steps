import { eventBus } from '../utils/eventBus'
import { clockSync } from '../utils/clockSync'

export type ClientState = {
  myUserId: string
  globalCounter: number
  latestPlayerId: string
  sceneStartTime: number
  playerCounter: number
  audioStreamUrl: string
}

export type ClientStore = ReturnType<typeof createClientStore>

export const createClientStore = () => {
  const state: ClientState = {
    myUserId: '',
    globalCounter: 0,
    latestPlayerId: 'None',
    sceneStartTime: 0,
    playerCounter: 0,
    audioStreamUrl: ''
  }

  return {
    getState(): Readonly<ClientState> {
      return state
    },

    setUserId(userId: string): void {
      state.myUserId = userId
    },

    updateWorldData(data: {
      globalCounter: number
      latestPlayerId: string
      latestPressTimestamp: number
      sceneStartTime: number
      serverTime: number
    }): void {
      clockSync.updateOffset(data.serverTime)
      state.globalCounter = data.globalCounter
      state.latestPlayerId = data.latestPlayerId
      state.sceneStartTime = data.sceneStartTime
      eventBus.emit('world:updated', state)
    },

    updatePlayerData(data: {
      userId: string
      playerCounter: number
      playerLastPressTimestamp: number
      serverTime: number
    }): void {
      clockSync.updateOffset(data.serverTime)
      if (data.userId === state.myUserId) {
        state.playerCounter = data.playerCounter
        eventBus.emit('player:updated', state)
      }
    },

    updateAudioUrl(url: string): void {
      state.audioStreamUrl = url
      eventBus.emit('audio:updated', state)
    }
  }
}
