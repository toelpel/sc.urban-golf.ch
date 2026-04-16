import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { usePlayerColors } from './usePlayerColors'
import type { Player } from '@/services/api'

describe('usePlayerColors', () => {
  it('returns a color for every player', () => {
    const players = ref<Player[]>([
      { id: 'p1', name: 'A' },
      { id: 'p2', name: 'B' },
      { id: 'p3', name: 'C' },
    ])
    const { colorMap } = usePlayerColors(players)
    expect(Object.keys(colorMap.value)).toHaveLength(3)
    for (const id of ['p1', 'p2', 'p3']) {
      expect(colorMap.value[id].color).toMatch(/^var\(--color-player-\d+\)$/)
    }
  })

  it('assigns colors deterministically based on sorted ids', () => {
    // Different insertion order, same sorted ids → same color mapping
    const a = ref<Player[]>([
      { id: 'zz', name: 'Zed' },
      { id: 'aa', name: 'Anna' },
      { id: 'mm', name: 'Max' },
    ])
    const b = ref<Player[]>([
      { id: 'mm', name: 'Max' },
      { id: 'zz', name: 'Zed' },
      { id: 'aa', name: 'Anna' },
    ])
    const colorsA = usePlayerColors(a).colorMap.value
    const colorsB = usePlayerColors(b).colorMap.value
    expect(colorsA.aa.color).toBe(colorsB.aa.color)
    expect(colorsA.mm.color).toBe(colorsB.mm.color)
    expect(colorsA.zz.color).toBe(colorsB.zz.color)
  })

  it('cycles colors when more players than palette entries', () => {
    const ids = Array.from({ length: 10 }, (_, i) => ({ id: `p${i}`, name: `P${i}` }))
    const players = ref<Player[]>(ids)
    const { colorMap } = usePlayerColors(players)
    // Expect all 10 to receive a valid color token
    for (const p of ids) {
      expect(colorMap.value[p.id]).toBeDefined()
      expect(colorMap.value[p.id].var).toMatch(/^--color-player-\d+$/)
    }
  })
})
