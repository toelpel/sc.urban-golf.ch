import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'

let observerCallback: (entries: { isIntersecting: boolean }[]) => void

vi.mock('@vueuse/core', () => ({
  useIntersectionObserver: vi.fn((target: unknown, callback: (entries: { isIntersecting: boolean }[]) => void) => {
    observerCallback = (entries) => callback(entries)
  }),
}))

import { useInfiniteLoader } from '../useInfiniteLoader'

describe('useInfiniteLoader', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loadMore() calls loadFn and manages loading state', async () => {
    const loadFn = vi.fn().mockResolvedValue(undefined)
    const target = ref(null)
    const hasMore = ref(true)

    const { loadMore, isLoading, isInitialLoad } = useInfiniteLoader({ loadFn, target, hasMore })

    expect(isInitialLoad.value).toBe(true)

    const loadPromise = loadMore()
    expect(isLoading.value).toBe(true)

    await loadPromise
    expect(isLoading.value).toBe(false)
    expect(isInitialLoad.value).toBe(false)
    expect(loadFn).toHaveBeenCalledTimes(1)
  })

  it('loadMore() prevents concurrent calls', async () => {
    let resolveFn: () => void
    const loadFn = vi.fn().mockImplementation(() => new Promise<void>(r => { resolveFn = r }))
    const target = ref(null)
    const hasMore = ref(true)

    const { loadMore } = useInfiniteLoader({ loadFn, target, hasMore })

    loadMore()
    loadMore() // should be ignored

    resolveFn!()
    await nextTick()

    expect(loadFn).toHaveBeenCalledTimes(1)
  })

  it('loadMore({ resetFirst: true }) calls loadFn with reset option', async () => {
    const loadFn = vi.fn().mockResolvedValue(undefined)
    const target = ref(null)
    const hasMore = ref(false)

    const { loadMore } = useInfiniteLoader({ loadFn, target, hasMore })
    await loadMore({ resetFirst: true })

    expect(loadFn).toHaveBeenCalledWith({ reset: true })
  })

  it('IntersectionObserver triggers loadMore when visible', async () => {
    const loadFn = vi.fn().mockResolvedValue(undefined)
    const target = ref(null)
    const hasMore = ref(true)

    const { isLoading } = useInfiniteLoader({ loadFn, target, hasMore })

    observerCallback([{ isIntersecting: true }])
    expect(loadFn).toHaveBeenCalled()
  })

  it('IntersectionObserver does not trigger when no more data', async () => {
    const loadFn = vi.fn().mockResolvedValue(undefined)
    const target = ref(null)
    const hasMore = ref(false)

    useInfiniteLoader({ loadFn, target, hasMore })

    observerCallback([{ isIntersecting: true }])
    expect(loadFn).not.toHaveBeenCalled()
  })
})
