import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export interface QueuedScore {
  id: string
  game_id: string
  player_id: string
  hole: number
  strokes: number
  queuedAt: number
}

export const useSyncQueueStore = defineStore('syncQueue', () => {
  const queue = useLocalStorage<QueuedScore[]>('ug-sync-queue', [])

  function enqueue(score: Omit<QueuedScore, 'id' | 'queuedAt'>) {
    // Deduplizierung: gleicher game+player+hole → neuesten Wert überschreiben
    const idx = queue.value.findIndex(
      i => i.game_id === score.game_id &&
           i.player_id === score.player_id &&
           i.hole === score.hole
    )
    const entry: QueuedScore = {
      ...score,
      id: crypto.randomUUID(),
      queuedAt: Date.now(),
    }
    if (idx >= 0) {
      queue.value[idx] = entry
    } else {
      queue.value.push(entry)
    }
  }

  function remove(id: string) {
    queue.value = queue.value.filter(i => i.id !== id)
  }

  function clear() {
    queue.value = []
  }

  return { queue, enqueue, remove, clear }
})
