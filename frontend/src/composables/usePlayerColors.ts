import { computed, type Ref } from 'vue'
import type { Player } from '@/services/api'

const PLAYER_COLOR_VARS = [
  '--color-player-1',
  '--color-player-2',
  '--color-player-3',
  '--color-player-4',
  '--color-player-5',
  '--color-player-6',
  '--color-player-7',
  '--color-player-8',
]

export interface PlayerColor {
  /** CSS color referencing a design token (var(--color-player-N)). */
  color: string
  /** Raw token name for style overrides. */
  var: string
}

export function usePlayerColors(players: Ref<Player[]>) {
  const colorMap = computed<Record<string, PlayerColor>>(() => {
    const map: Record<string, PlayerColor> = {}
    const stable = [...players.value].sort((a, b) => a.id.localeCompare(b.id))
    stable.forEach((player, i) => {
      const varName = PLAYER_COLOR_VARS[i % PLAYER_COLOR_VARS.length]
      map[player.id] = { color: `var(${varName})`, var: varName }
    })
    return map
  })

  return { colorMap }
}
