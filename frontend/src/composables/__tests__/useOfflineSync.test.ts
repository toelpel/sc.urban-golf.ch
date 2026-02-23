import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, effectScope, nextTick, type EffectScope } from 'vue'
import { setActivePinia, createPinia } from 'pinia'

const mockIsOnline = ref(true)
vi.mock('@vueuse/core', () => ({
  useOnline: () => mockIsOnline,
  useLocalStorage: (key: string, defaultValue: unknown) => ref(defaultValue),
}))

vi.mock('@/services/api', () => ({
  saveScore: vi.fn(),
}))

const mockSuccess = vi.fn()
const mockError = vi.fn()
vi.mock('@/composables/useToast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
  }),
}))

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).slice(2, 9)),
})

import { useOfflineSync } from '../useOfflineSync'
import { useSyncQueueStore } from '@/stores/syncQueue'
import { saveScore as apiSaveScore } from '@/services/api'

const mockApiSave = vi.mocked(apiSaveScore)

describe('useOfflineSync', () => {
  let scope: EffectScope
  let store: ReturnType<typeof useSyncQueueStore>

  beforeEach(() => {
    scope = effectScope()
    setActivePinia(createPinia())
    store = useSyncQueueStore()
    mockIsOnline.value = true
    mockApiSave.mockReset()
    mockSuccess.mockClear()
    mockError.mockClear()
    localStorage.clear()
  })

  afterEach(() => {
    scope.stop()
  })

  it('calls API directly when online', async () => {
    mockApiSave.mockResolvedValue({ id: 1, game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 })
    const { saveScore } = scope.run(() => useOfflineSync())!

    await saveScore({ game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 })

    expect(mockApiSave).toHaveBeenCalledWith({
      game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3,
    })
    expect(store.queue).toHaveLength(0)
  })

  it('queues score when offline', async () => {
    mockIsOnline.value = false
    const { saveScore } = scope.run(() => useOfflineSync())!

    await saveScore({ game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 })

    expect(mockApiSave).not.toHaveBeenCalled()
    expect(store.queue).toHaveLength(1)
    expect(store.queue[0]).toMatchObject({ game_id: 'g1234567890123', hole: 1, strokes: 3 })
  })

  it('flushQueue() sends all queued scores and removes them', async () => {
    const { flushQueue } = scope.run(() => useOfflineSync())!

    store.enqueue({ game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 })
    store.enqueue({ game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 2, strokes: 4 })
    expect(store.queue).toHaveLength(2)

    mockApiSave.mockResolvedValue({ id: 1, game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 })

    await flushQueue()

    expect(mockApiSave).toHaveBeenCalledTimes(2)
    expect(store.queue).toHaveLength(0)
    expect(mockSuccess).toHaveBeenCalledWith('2 Score(s) synchronisiert.', 3000)
  })

  it('flushQueue() does nothing when offline', async () => {
    mockIsOnline.value = false
    const { saveScore, flushQueue } = scope.run(() => useOfflineSync())!

    await saveScore({ game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 })
    await flushQueue()

    expect(mockApiSave).not.toHaveBeenCalled()
  })

  it('flushQueue() does nothing when queue is empty', async () => {
    const { flushQueue } = scope.run(() => useOfflineSync())!
    await flushQueue()

    expect(mockApiSave).not.toHaveBeenCalled()
  })

  it('flushQueue() handles partial failures', async () => {
    const { flushQueue } = scope.run(() => useOfflineSync())!

    store.enqueue({ game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 })
    store.enqueue({ game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 2, strokes: 4 })

    mockApiSave
      .mockResolvedValueOnce({ id: 1, game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 })
      .mockRejectedValueOnce(new Error('Network error'))

    await flushQueue()

    expect(store.queue).toHaveLength(1)
    expect(store.queue[0].hole).toBe(2)
    expect(mockSuccess).toHaveBeenCalledWith('1 Score(s) synchronisiert.', 3000)
    expect(mockError).toHaveBeenCalledWith('1 Score(s) konnten nicht synchronisiert werden.', 6000)
  })

  it('auto-flushes when coming back online', async () => {
    mockIsOnline.value = false
    scope.run(() => useOfflineSync())

    store.enqueue({ game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 })
    mockApiSave.mockResolvedValue({ id: 1, game_id: 'g1234567890123', player_id: 'p1234567890123', hole: 1, strokes: 3 })

    // Going online triggers the watcher which calls flushQueue
    mockIsOnline.value = true
    await nextTick()
    // Give async flushQueue time to complete
    await new Promise(r => setTimeout(r, 50))

    expect(mockApiSave).toHaveBeenCalled()
    expect(store.queue).toHaveLength(0)
  })
})
