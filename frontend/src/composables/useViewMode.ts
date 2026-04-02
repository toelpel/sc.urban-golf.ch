import { ref, watch, type Ref } from 'vue'
import type { Player } from '@/services/api'

type ViewMode = 'horizontal' | 'vertical' | 'ranking'

export function useViewMode(players: Ref<Player[]>, holes: Ref<number[]>) {
  const viewMode = ref<ViewMode>('horizontal')

  function loadPreference() {
    const saved = localStorage.getItem('GamesDetailView')
    if (saved === 'horizontal' || saved === 'vertical' || saved === 'ranking') {
      viewMode.value = saved
    } else {
      viewMode.value =
        players.value.length > 4 && holes.value.length <= 4 ? 'horizontal' : 'vertical'
    }
  }

  const viewModes: ViewMode[] = ['horizontal', 'vertical', 'ranking']

  function toggleView() {
    const idx = viewModes.indexOf(viewMode.value)
    viewMode.value = viewModes[(idx + 1) % viewModes.length]
  }

  watch(viewMode, (val) => {
    localStorage.setItem('GamesDetailView', val)
  })

  return { viewMode, toggleView, loadPreference }
}
