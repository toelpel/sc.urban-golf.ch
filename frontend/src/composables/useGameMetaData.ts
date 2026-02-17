import { ref } from 'vue'
import { useGamesDetailData } from './useGamesDetailData'

interface PlayerMeta {
  id: string
  name: string
  total: number
  avg: number
}

interface GameMeta {
  gameName: string
  holes: number[]
  players: PlayerMeta[]
}

// Modul-level Cache: verhindert redundante API-Calls für bereits geladene Game-Metadaten.
// Der Cache überlebt die gesamte App-Session.
const metaCache = new Map<string, GameMeta>()

export async function useGameMetaData(gameId: string): Promise<GameMeta> {
  if (metaCache.has(gameId)) return metaCache.get(gameId)!

  const { players, scores, holes, gameName, load } = useGamesDetailData(ref(gameId))
  await load()

  const metaPlayers: PlayerMeta[] = players.value.map((player) => {
    const playerScores = scores.value[player.id] || {}
    const strokeValues = Object.values(playerScores).map((s) => Number(s)).filter((n) => !isNaN(n))
    const total = strokeValues.reduce((sum, s) => sum + s, 0)
    const avg = strokeValues.length ? total / strokeValues.length : 0
    return { id: player.id, name: player.name, total, avg }
  })

  const meta: GameMeta = {
    gameName: gameName.value,
    holes: holes.value,
    players: metaPlayers,
  }

  metaCache.set(gameId, meta)
  return meta
}
