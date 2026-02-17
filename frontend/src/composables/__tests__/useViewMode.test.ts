import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useViewMode } from '../useViewMode'

describe('useViewMode', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('toggleView', () => {
    it('switches from horizontal to vertical', () => {
      const players = ref([{ id: 'p1', name: 'Player 1' }])
      const holes = ref([1, 2, 3])
      const { viewMode, toggleView } = useViewMode(players, holes)
      viewMode.value = 'horizontal'
      toggleView()
      expect(viewMode.value).toBe('vertical')
    })

    it('switches from vertical to horizontal', () => {
      const players = ref([{ id: 'p1', name: 'Player 1' }])
      const holes = ref([1, 2, 3])
      const { viewMode, toggleView } = useViewMode(players, holes)
      viewMode.value = 'vertical'
      toggleView()
      expect(viewMode.value).toBe('horizontal')
    })
  })

  describe('loadPreference', () => {
    it('loads saved horizontal preference from localStorage', () => {
      localStorage.setItem('GamesDetailView', 'horizontal')
      const players = ref([{ id: 'p1', name: 'Player 1' }])
      const holes = ref([1, 2, 3])
      const { viewMode, loadPreference } = useViewMode(players, holes)
      loadPreference()
      expect(viewMode.value).toBe('horizontal')
    })

    it('loads saved vertical preference from localStorage', () => {
      localStorage.setItem('GamesDetailView', 'vertical')
      const players = ref([{ id: 'p1', name: 'Player 1' }])
      const holes = ref([1, 2, 3])
      const { viewMode, loadPreference } = useViewMode(players, holes)
      loadPreference()
      expect(viewMode.value).toBe('vertical')
    })

    it('defaults to horizontal when many players and few holes', () => {
      const players = ref([
        { id: 'p1', name: 'Player 1' }, { id: 'p2', name: 'Player 2' }, { id: 'p3', name: 'Player 3' },
        { id: 'p4', name: 'Player 4' }, { id: 'p5', name: 'Player 5' },
      ])
      const holes = ref([1, 2, 3])
      const { viewMode, loadPreference } = useViewMode(players, holes)
      loadPreference()
      expect(viewMode.value).toBe('horizontal')
    })

    it('defaults to vertical when few players and many holes', () => {
      const players = ref([{ id: 'p1', name: 'Player 1' }, { id: 'p2', name: 'Player 2' }])
      const holes = ref([1, 2, 3, 4, 5, 6, 7, 8, 9])
      const { viewMode, loadPreference } = useViewMode(players, holes)
      loadPreference()
      expect(viewMode.value).toBe('vertical')
    })

    it('ignores invalid localStorage value and uses default', () => {
      localStorage.setItem('GamesDetailView', 'invalid_value')
      const players = ref([{ id: 'p1', name: 'Player 1' }, { id: 'p2', name: 'Player 2' }])
      const holes = ref([1, 2, 3, 4, 5, 6, 7, 8, 9])
      const { viewMode, loadPreference } = useViewMode(players, holes)
      loadPreference()
      // With 2 players and 9 holes: not (>4 players && <=4 holes), so vertical
      expect(viewMode.value).toBe('vertical')
    })
  })
})
