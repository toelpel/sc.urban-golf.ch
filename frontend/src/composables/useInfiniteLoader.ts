import { ref, nextTick, type Ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

interface UseInfiniteLoaderOptions {
  loadFn: (opts?: { reset?: boolean }) => Promise<void>
  target: Ref<HTMLElement | null>
  hasMore: Ref<boolean>
}

export function useInfiniteLoader({ loadFn, target, hasMore }: UseInfiniteLoaderOptions) {
  const isLoading = ref(false)
  const isInitialLoad = ref(true)

  async function loadMore({ resetFirst = false } = {}) {
    if (isLoading.value) return

    isLoading.value = true
    if (resetFirst) {
      await loadFn({ reset: true })
    } else {
      await loadFn()
    }
    isLoading.value = false

    isInitialLoad.value = false

    await nextTick()
    setTimeout(() => {
      const el = target.value
      if (el && hasMore.value && el.getBoundingClientRect().top < window.innerHeight) {
        loadMore()
      }
    }, 200)
  }

  useIntersectionObserver(target, ([{ isIntersecting }]) => {
    if (isIntersecting && hasMore.value && !isLoading.value) {
      loadMore()
    }
  })

  return {
    loadMore,
    isInitialLoad,
    isLoading,
  }
}
