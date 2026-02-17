import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import {
  fetchGamesSummary,
  fetchGame,
  fetchGamePlayers,
  createOrUpdatePlayer,
  createOrUpdatePlayers,
  fetchScores,
  saveScore,
  submitFeedback,
} from '../api'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchGamesSummary calls correct endpoint', async () => {
    mockedAxios.get.mockResolvedValue({ data: { games: [] } })
    const result = await fetchGamesSummary({ page: 1, per_page: 10 })
    expect(mockedAxios.get).toHaveBeenCalledWith('/games/summary', {
      params: { page: 1, per_page: 10 },
    })
    expect(result).toEqual({ games: [] })
  })

  it('fetchGame calls correct endpoint', async () => {
    mockedAxios.get.mockResolvedValue({ data: { id: 'abc', name: 'Test' } })
    const result = await fetchGame('abc')
    expect(mockedAxios.get).toHaveBeenCalledWith('/games/abc')
    expect(result.name).toBe('Test')
  })

  it('fetchGamePlayers calls correct endpoint', async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: 'p1', name: 'Alice' }] })
    const result = await fetchGamePlayers('abc')
    expect(mockedAxios.get).toHaveBeenCalledWith('/games/abc/players')
    expect(result).toHaveLength(1)
  })

  it('createOrUpdatePlayers uses Promise.all for parallel calls', async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 'p1', name: 'A', status: 'upserted' } })
    const players = [
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' },
    ]
    const results = await createOrUpdatePlayers(players)
    expect(mockedAxios.post).toHaveBeenCalledTimes(2)
    expect(results).toHaveLength(2)
  })

  it('fetchScores calls correct endpoint with game_id param', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] })
    await fetchScores('game1')
    expect(mockedAxios.get).toHaveBeenCalledWith('/scores', {
      params: { game_id: 'game1' },
    })
  })

  it('saveScore posts to scores endpoint', async () => {
    mockedAxios.post.mockResolvedValue({ data: { id: 1 } })
    await saveScore({ game_id: 'g1', player_id: 'p1', hole: 1, strokes: 3 })
    expect(mockedAxios.post).toHaveBeenCalledWith('/scores', {
      game_id: 'g1',
      player_id: 'p1',
      hole: 1,
      strokes: 3,
    })
  })

  it('submitFeedback posts to feedback endpoint', async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } })
    await submitFeedback({ rating: 5, message: 'Great!' })
    expect(mockedAxios.post).toHaveBeenCalledWith('/feedback', {
      rating: 5,
      message: 'Great!',
    })
  })
})
