import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSyncQueueStore } from '../syncQueue'

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).slice(2, 9)),
})

describe('useSyncQueueStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('enqueue() adds a score to the queue', () => {
    const store = useSyncQueueStore()
    store.enqueue({ game_id: 'game1234567890', player_id: 'player1234567890', hole: 1, strokes: 3 })

    expect(store.queue).toHaveLength(1)
    expect(store.queue[0]).toMatchObject({
      game_id: 'game1234567890',
      player_id: 'player1234567890',
      hole: 1,
      strokes: 3,
    })
    expect(store.queue[0].id).toBeDefined()
    expect(store.queue[0].queuedAt).toBeDefined()
  })

  it('enqueue() deduplicates by game+player+hole', () => {
    const store = useSyncQueueStore()
    store.enqueue({ game_id: 'game1234567890', player_id: 'player1234567890', hole: 1, strokes: 3 })
    store.enqueue({ game_id: 'game1234567890', player_id: 'player1234567890', hole: 1, strokes: 5 })

    expect(store.queue).toHaveLength(1)
    expect(store.queue[0].strokes).toBe(5)
  })

  it('enqueue() keeps separate entries for different holes', () => {
    const store = useSyncQueueStore()
    store.enqueue({ game_id: 'game1234567890', player_id: 'player1234567890', hole: 1, strokes: 3 })
    store.enqueue({ game_id: 'game1234567890', player_id: 'player1234567890', hole: 2, strokes: 4 })

    expect(store.queue).toHaveLength(2)
  })

  it('enqueue() keeps separate entries for different players', () => {
    const store = useSyncQueueStore()
    store.enqueue({ game_id: 'game1234567890', player_id: 'playerA234567890', hole: 1, strokes: 3 })
    store.enqueue({ game_id: 'game1234567890', player_id: 'playerB234567890', hole: 1, strokes: 4 })

    expect(store.queue).toHaveLength(2)
  })

  it('remove() deletes a specific entry by id', () => {
    const store = useSyncQueueStore()
    store.enqueue({ game_id: 'game1234567890', player_id: 'player1234567890', hole: 1, strokes: 3 })
    store.enqueue({ game_id: 'game1234567890', player_id: 'player1234567890', hole: 2, strokes: 4 })

    const idToRemove = store.queue[0].id
    store.remove(idToRemove)

    expect(store.queue).toHaveLength(1)
    expect(store.queue[0].hole).toBe(2)
  })

  it('remove() does nothing if id not found', () => {
    const store = useSyncQueueStore()
    store.enqueue({ game_id: 'game1234567890', player_id: 'player1234567890', hole: 1, strokes: 3 })
    store.remove('nonexistent-id')

    expect(store.queue).toHaveLength(1)
  })

  it('clear() empties the queue', () => {
    const store = useSyncQueueStore()
    store.enqueue({ game_id: 'game1234567890', player_id: 'player1234567890', hole: 1, strokes: 3 })
    store.enqueue({ game_id: 'game1234567890', player_id: 'player1234567890', hole: 2, strokes: 4 })

    store.clear()
    expect(store.queue).toHaveLength(0)
  })
})
