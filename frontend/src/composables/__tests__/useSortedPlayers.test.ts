import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useSortedPlayers } from '../useSortedPlayers'

function setup() {
  const players = ref([
    { id: 'p1', name: 'Charlie' },
    { id: 'p2', name: 'Alice' },
    { id: 'p3', name: 'Bob' },
  ])
  const scores = ref({
    p1: { 1: 3, 2: 4 },       // total=7,  avg=3.5
    p2: { 1: 5, 2: 2 },       // total=7,  avg=3.5
    p3: { 1: 2, 2: 1, 3: 6 }, // total=9,  avg=3.0
  })
  return { players, scores }
}

describe('useSortedPlayers', () => {
  describe('sorting by name', () => {
    it('sorts ascending by default', () => {
      const { players, scores } = setup()
      const { sortedPlayers } = useSortedPlayers(players, scores)
      const names = sortedPlayers.value.map(p => p.name)
      expect(names).toEqual(['Alice', 'Bob', 'Charlie'])
    })

    it('sorts descending when direction is desc', () => {
      const { players, scores } = setup()
      const { sortedPlayers, sortDirection } = useSortedPlayers(players, scores)
      sortDirection.value = 'desc'
      const names = sortedPlayers.value.map(p => p.name)
      expect(names).toEqual(['Charlie', 'Bob', 'Alice'])
    })
  })

  describe('sorting by total', () => {
    it('sorts ascending by total score', () => {
      const { players, scores } = setup()
      const { sortedPlayers, sortColumn } = useSortedPlayers(players, scores)
      sortColumn.value = 'total'
      const ids = sortedPlayers.value.map(p => p.id)
      // p1=7, p2=7, p3=9 => p1/p2 first (tie), then p3
      expect(ids[2]).toBe('p3')
      expect([ids[0], ids[1]].sort()).toEqual(['p1', 'p2'])
    })

    it('sorts descending by total score', () => {
      const { players, scores } = setup()
      const { sortedPlayers, sortColumn, sortDirection } = useSortedPlayers(players, scores)
      sortColumn.value = 'total'
      sortDirection.value = 'desc'
      const ids = sortedPlayers.value.map(p => p.id)
      // p3=9 first, then p1/p2=7
      expect(ids[0]).toBe('p3')
    })
  })

  describe('sorting by average', () => {
    it('sorts ascending by average score', () => {
      const { players, scores } = setup()
      const { sortedPlayers, sortColumn } = useSortedPlayers(players, scores)
      sortColumn.value = 'average'
      const ids = sortedPlayers.value.map(p => p.id)
      // p3 avg=3.0, p1 avg=3.5, p2 avg=3.5 => p3 first
      expect(ids[0]).toBe('p3')
    })

    it('sorts descending by average score', () => {
      const { players, scores } = setup()
      const { sortedPlayers, sortColumn, sortDirection } = useSortedPlayers(players, scores)
      sortColumn.value = 'average'
      sortDirection.value = 'desc'
      const ids = sortedPlayers.value.map(p => p.id)
      // p1/p2 avg=3.5 first, p3 avg=3.0 last
      expect(ids[2]).toBe('p3')
    })
  })

  describe('totalScore', () => {
    it('returns the sum of all scores for a player', () => {
      const { players, scores } = setup()
      const { totalScore } = useSortedPlayers(players, scores)
      expect(totalScore('p1')).toBe(7)
      expect(totalScore('p3')).toBe(9)
    })

    it('returns 0 for a player with no scores', () => {
      const { players, scores } = setup()
      const { totalScore } = useSortedPlayers(players, scores)
      expect(totalScore('unknown')).toBe(0)
    })
  })

  describe('averageScore', () => {
    it('returns the average formatted to 1 decimal', () => {
      const { players, scores } = setup()
      const { averageScore } = useSortedPlayers(players, scores)
      expect(averageScore('p1')).toBe('3.5')
      expect(averageScore('p3')).toBe('3.0')
    })

    it('returns dash for a player with no scores', () => {
      const { players, scores } = setup()
      const { averageScore } = useSortedPlayers(players, scores)
      expect(averageScore('unknown')).toBe('\u2013')
    })
  })
})
