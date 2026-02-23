import type { InjectionKey, Ref } from 'vue'
import type { Player } from '@/services/api'

export type ScoreMap = { [playerId: string]: { [hole: number]: number | string } }

export interface GamesDetailContext {
  players: Ref<Player[]>
  scores: Ref<ScoreMap>
  holes: Ref<number[]>
  gameName: Ref<string>
  load: () => Promise<void>
}

export const gamesDetailKey: InjectionKey<GamesDetailContext> = Symbol('gamesDetailData')
