import { ref } from 'vue'
import { fetchGamesSummary } from '@/services/api'
import type { GameSummary } from '@/services/api'

interface PlayerMapEntry { [gameId: string]: string[] }
interface GameMetaEntry {
  players: GameSummary['players']
  holes: number[]
}

export function useGamesSummaryData() {
  const games = ref<GameSummary[]>([])
  const playerMap = ref<PlayerMapEntry>({})
  const gameMeta = ref<{ [id: string]: GameMetaEntry }>({})
  const totalGames = ref<number>(0)
  const page = ref<number>(1)
  const hasMore = ref<boolean>(true)
  const error = ref<string | null>(null)

  async function loadGames({ perPage = 10, search = '' }: { perPage?: number; search?: string }) {
    error.value = null
    try {
      const data = await fetchGamesSummary({
        page: page.value,
        per_page: perPage,
        search,
      })

      if (!Array.isArray(data.games)) {
        throw new Error('Antwort enthält keine gültige Spieleliste')
      }

      games.value.push(...data.games)

      for (const game of data.games) {
        playerMap.value[game.id] = (game.players || []).map((p) => p.name)
        gameMeta.value[game.id] = {
          players: game.players,
          holes: game.holes || [],
        }
      }

      page.value++
      hasMore.value = data.games.length === perPage
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load games'
      error.value = message
      console.error('Error loading games summary:', message)
    }
  }

  function reset() {
    games.value = []
    playerMap.value = {}
    gameMeta.value = {}
    totalGames.value = 0
    page.value = 1
    hasMore.value = true
    error.value = null
  }

  return {
    games,
    playerMap,
    gameMeta,
    totalGames,
    page,
    hasMore,
    error,
    loadGames,
    reset,
  }
}
