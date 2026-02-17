import { ref, watch, type Ref } from 'vue'
import type { Player } from '@/services/api'

type ViewMode = 'horizontal' | 'vertical'

export function useViewMode(players: Ref<Player[]>, holes: Ref<number[]>) {
  const viewMode = ref<ViewMode>('horizontal')

  function loadPreference() {
    const saved = localStorage.getItem('GamesDetailView')
    if (saved === 'horizontal' || saved === 'vertical') {
      viewMode.value = saved
    } else {
      viewMode.value =
        players.value.length > 4 && holes.value.length <= 4 ? 'horizontal' : 'vertical'
    }
  }

  function toggleView() {
    viewMode.value = viewMode.value === 'horizontal' ? 'vertical' : 'horizontal'
  }

  watch(viewMode, (val) => {
    localStorage.setItem('GamesDetailView', val)
  })

  return { viewMode, toggleView, loadPreference }
}
