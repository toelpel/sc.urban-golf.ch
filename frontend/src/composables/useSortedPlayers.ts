import { ref, computed, type Ref } from 'vue'
import type { Player } from '@/services/api'

type SortColumn = 'name' | 'total' | 'average'
type SortDirection = 'asc' | 'desc'
type ScoreMap = { [playerId: string]: { [hole: number]: number | string } }

export function useSortedPlayers(players: Ref<Player[]>, scores: Ref<ScoreMap>) {
  const sortColumn = ref<SortColumn>('name')
  const sortDirection = ref<SortDirection>('asc')

  const totalScore = (playerId: string): number => {
    const s = scores.value[playerId] || {}
    return Object.values(s)
      .map((n) => parseInt(String(n)) || 0)
      .reduce((a, b) => a + b, 0)
  }

  const averageScore = (playerId: string): string => {
    const s = scores.value[playerId] || {}
    const values = Object.values(s)
      .map((n) => parseInt(String(n)))
      .filter((n) => !isNaN(n))
    return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : '–'
  }

  const sortedPlayers = computed<Player[]>(() => {
    return [...players.value].sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      if (sortColumn.value === 'name') {
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
      } else if (sortColumn.value === 'total') {
        aVal = totalScore(a.id)
        bVal = totalScore(b.id)
      } else {
        aVal = parseFloat(averageScore(a.id)) || 0
        bVal = parseFloat(averageScore(b.id)) || 0
      }

      if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  })

  return { sortColumn, sortDirection, sortedPlayers, totalScore, averageScore }
}
