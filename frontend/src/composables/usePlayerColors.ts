import { computed, type Ref } from 'vue'
import type { Player } from '@/services/api'

const PLAYER_COLORS = [
  { bg: 'bg-blue-500/15 dark:bg-blue-400/10', border: 'border-l-blue-500 dark:border-l-blue-400', dot: 'bg-blue-500 dark:bg-blue-400' },
  { bg: 'bg-emerald-500/15 dark:bg-emerald-400/10', border: 'border-l-emerald-500 dark:border-l-emerald-400', dot: 'bg-emerald-500 dark:bg-emerald-400' },
  { bg: 'bg-amber-500/15 dark:bg-amber-400/10', border: 'border-l-amber-500 dark:border-l-amber-400', dot: 'bg-amber-500 dark:bg-amber-400' },
  { bg: 'bg-rose-500/15 dark:bg-rose-400/10', border: 'border-l-rose-500 dark:border-l-rose-400', dot: 'bg-rose-500 dark:bg-rose-400' },
  { bg: 'bg-violet-500/15 dark:bg-violet-400/10', border: 'border-l-violet-500 dark:border-l-violet-400', dot: 'bg-violet-500 dark:bg-violet-400' },
  { bg: 'bg-cyan-500/15 dark:bg-cyan-400/10', border: 'border-l-cyan-500 dark:border-l-cyan-400', dot: 'bg-cyan-500 dark:bg-cyan-400' },
  { bg: 'bg-orange-500/15 dark:bg-orange-400/10', border: 'border-l-orange-500 dark:border-l-orange-400', dot: 'bg-orange-500 dark:bg-orange-400' },
  { bg: 'bg-pink-500/15 dark:bg-pink-400/10', border: 'border-l-pink-500 dark:border-l-pink-400', dot: 'bg-pink-500 dark:bg-pink-400' },
  { bg: 'bg-teal-500/15 dark:bg-teal-400/10', border: 'border-l-teal-500 dark:border-l-teal-400', dot: 'bg-teal-500 dark:bg-teal-400' },
  { bg: 'bg-indigo-500/15 dark:bg-indigo-400/10', border: 'border-l-indigo-500 dark:border-l-indigo-400', dot: 'bg-indigo-500 dark:bg-indigo-400' },
]

export function usePlayerColors(players: Ref<Player[]>) {
  const colorMap = computed(() => {
    const map: Record<string, typeof PLAYER_COLORS[0]> = {}
    players.value.forEach((player, i) => {
      map[player.id] = PLAYER_COLORS[i % PLAYER_COLORS.length]
    })
    return map
  })

  return { colorMap }
}
