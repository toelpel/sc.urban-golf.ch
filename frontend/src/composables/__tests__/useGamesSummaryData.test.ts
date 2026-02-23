import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/api', () => ({
  fetchGamesSummary: vi.fn(),
}))

import { useGamesSummaryData } from '../useGamesSummaryData'
import { fetchGamesSummary } from '@/services/api'

const mockFetch = vi.mocked(fetchGamesSummary)

describe('useGamesSummaryData', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('loadGames() fetches and stores games', async () => {
    mockFetch.mockResolvedValue({
      games: [
        {
          id: 'game1234567890',
          name: 'Test Game',
          players: [{ id: 'p1', name: 'Alice', avg: 3.5, total: 7 }],
          holes: [1, 2],
        },
      ],
    })

    const { loadGames, games, playerMap, gameMeta, page, hasMore } = useGamesSummaryData()
    await loadGames({ perPage: 10 })

    expect(mockFetch).toHaveBeenCalledWith({ page: 1, per_page: 10, search: '' })
    expect(games.value).toHaveLength(1)
    expect(games.value[0].name).toBe('Test Game')
    expect(playerMap.value['game1234567890']).toEqual(['Alice'])
    expect(gameMeta.value['game1234567890'].holes).toEqual([1, 2])
    expect(page.value).toBe(2)
    // Only 1 game returned but perPage is 10 → no more
    expect(hasMore.value).toBe(false)
  })

  it('loadGames() appends to existing games (pagination)', async () => {
    mockFetch
      .mockResolvedValueOnce({
        games: Array.from({ length: 10 }, (_, i) => ({
          id: `game${i}1234567890`,
          name: `Game ${i}`,
          players: [],
          holes: [],
        })),
      })
      .mockResolvedValueOnce({
        games: [{ id: 'game_extra12345', name: 'Extra', players: [], holes: [] }],
      })

    const { loadGames, games, hasMore } = useGamesSummaryData()

    await loadGames({ perPage: 10 })
    expect(games.value).toHaveLength(10)
    expect(hasMore.value).toBe(true)

    await loadGames({ perPage: 10 })
    expect(games.value).toHaveLength(11)
    expect(hasMore.value).toBe(false)
  })

  it('loadGames() passes search parameter', async () => {
    mockFetch.mockResolvedValue({ games: [] })

    const { loadGames } = useGamesSummaryData()
    await loadGames({ perPage: 10, search: 'alpha' })

    expect(mockFetch).toHaveBeenCalledWith({ page: 1, per_page: 10, search: 'alpha' })
  })

  it('loadGames() sets error on failure', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockRejectedValue(new Error('Network failure'))

    const { loadGames, error, games } = useGamesSummaryData()
    await loadGames({ perPage: 10 })

    expect(error.value).toBe('Network failure')
    expect(games.value).toHaveLength(0)
    vi.restoreAllMocks()
  })

  it('loadGames() sets error for invalid response', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockFetch.mockResolvedValue({ games: 'not-an-array' } as unknown as any)

    const { loadGames, error } = useGamesSummaryData()
    await loadGames({ perPage: 10 })

    expect(error.value).toBe('Antwort enthält keine gültige Spieleliste')
    vi.restoreAllMocks()
  })

  it('reset() clears all state', async () => {
    mockFetch.mockResolvedValue({
      games: [{ id: 'g1234567890123', name: 'G', players: [], holes: [] }],
    })

    const { loadGames, reset, games, playerMap, gameMeta, page, hasMore, error } = useGamesSummaryData()
    await loadGames({ perPage: 10 })

    reset()

    expect(games.value).toHaveLength(0)
    expect(playerMap.value).toEqual({})
    expect(gameMeta.value).toEqual({})
    expect(page.value).toBe(1)
    expect(hasMore.value).toBe(true)
    expect(error.value).toBeNull()
  })
})
