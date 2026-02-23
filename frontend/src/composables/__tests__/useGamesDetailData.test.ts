import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'

vi.mock('@/services/api', () => ({
  fetchGame: vi.fn(),
  fetchGamePlayers: vi.fn(),
  fetchScores: vi.fn(),
}))

import { useGamesDetailData } from '../useGamesDetailData'
import { fetchGame, fetchGamePlayers, fetchScores } from '@/services/api'

const mockFetchGame = vi.mocked(fetchGame)
const mockFetchPlayers = vi.mocked(fetchGamePlayers)
const mockFetchScores = vi.mocked(fetchScores)

describe('useGamesDetailData', () => {
  beforeEach(() => {
    mockFetchGame.mockReset()
    mockFetchPlayers.mockReset()
    mockFetchScores.mockReset()
  })

  it('load() fetches game, players and scores', async () => {
    mockFetchGame.mockResolvedValue({ id: 'g1234567890123', name: 'Test Game' })
    mockFetchPlayers.mockResolvedValue([
      { id: 'p1234567890123', name: 'Alice' },
      { id: 'p2345678901234', name: 'Bob' },
    ])
    mockFetchScores.mockResolvedValue([
      { game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 },
      { game_id: 'g1234567890123', player_id: 'p2345678901234', hole: 1, strokes: 5 },
      { game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 2, strokes: 4 },
    ])

    const gameId = ref('g1234567890123')
    const { load, gameName, players, scores, holes, error } = useGamesDetailData(gameId)
    await load()

    expect(gameName.value).toBe('Test Game')
    expect(players.value).toHaveLength(2)
    expect(scores.value['p1234567890123'][1]).toBe(3)
    expect(scores.value['p1234567890123'][2]).toBe(4)
    expect(scores.value['p2345678901234'][1]).toBe(5)
    expect(holes.value).toEqual([1, 2])
    expect(error.value).toBeNull()
  })

  it('load() uses fallback game name when missing', async () => {
    mockFetchGame.mockResolvedValue({ id: 'g1234567890123', name: '' })
    mockFetchPlayers.mockResolvedValue([])
    mockFetchScores.mockResolvedValue([])

    const gameId = ref('g1234567890123')
    const { load, gameName } = useGamesDetailData(gameId)
    await load()

    expect(gameName.value).toBe('Game #g1234567890123')
  })

  it('load() defaults to hole 1 when no scores exist', async () => {
    mockFetchGame.mockResolvedValue({ id: 'g1234567890123', name: 'New Game' })
    mockFetchPlayers.mockResolvedValue([{ id: 'p1234567890123', name: 'Alice' }])
    mockFetchScores.mockResolvedValue([])

    const gameId = ref('g1234567890123')
    const { load, holes } = useGamesDetailData(gameId)
    await load()

    expect(holes.value).toEqual([1])
  })

  it('load() handles scores for players not in player list', async () => {
    mockFetchGame.mockResolvedValue({ id: 'g1234567890123', name: 'Game' })
    mockFetchPlayers.mockResolvedValue([{ id: 'p1234567890123', name: 'Alice' }])
    mockFetchScores.mockResolvedValue([
      { game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 },
      { game_id: 'g1234567890123', player_id: 'pUnknown1234567', hole: 1, strokes: 5 },
    ])

    const gameId = ref('g1234567890123')
    const { load, scores } = useGamesDetailData(gameId)
    await load()

    expect(scores.value['p1234567890123'][1]).toBe(3)
    expect(scores.value['pUnknown1234567'][1]).toBe(5)
  })

  it('load() sets error on failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetchGame.mockRejectedValue(new Error('API down'))
    mockFetchPlayers.mockRejectedValue(new Error('API down'))
    mockFetchScores.mockRejectedValue(new Error('API down'))

    const gameId = ref('g1234567890123')
    const { load, error } = useGamesDetailData(gameId)
    await load()

    expect(error.value).toBe('API down')
    vi.restoreAllMocks()
  })
})
