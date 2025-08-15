import { ref, watch } from 'vue'
import { useWindowScroll } from '@vueuse/core'

export function useScrollToTopButton(threshold = 300) {
    const showScrollToTop = ref(false)
    const { y } = useWindowScroll()

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    watch(y, (value) => {
        showScrollToTop.value = value > threshold
    })

    return {
        showScrollToTop,
        scrollToTop
    }
}