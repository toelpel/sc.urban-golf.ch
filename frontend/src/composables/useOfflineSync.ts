import { watch } from 'vue'
import { useOnline } from '@vueuse/core'
import { useSyncQueueStore } from '@/stores/syncQueue'
import { saveScore as apiSaveScore } from '@/services/api'
import { useToast } from '@/composables/useToast'

export function useOfflineSync() {
  const queue = useSyncQueueStore()
  const isOnline = useOnline()
  const { success, error } = useToast()

  async function saveScore(payload: {
    game_id: string
    player_id: string
    hole: number
    strokes: number
  }): Promise<void> {
    if (!isOnline.value) {
      // Offline: in Queue legen. Optimistisches UI: caller hat lokalen State bereits aktualisiert.
      queue.enqueue(payload)
      return
    }
    await apiSaveScore(payload)
  }

  async function flushQueue(): Promise<void> {
    if (!isOnline.value || queue.queue.length === 0) return

    const items = [...queue.queue]
    let successCount = 0
    let failCount = 0

    for (const item of items) {
      try {
        await apiSaveScore({
          game_id: item.game_id,
          player_id: item.player_id,
          hole: item.hole,
          strokes: item.strokes,
        })
        queue.remove(item.id)
        successCount++
      } catch {
        failCount++
      }
    }

    if (successCount > 0) {
      success(`${successCount} Score(s) synchronisiert.`, 3000)
    }
    if (failCount > 0) {
      error(`${failCount} Score(s) konnten nicht synchronisiert werden.`, 6000)
    }
  }

  // Automatisch flushen wenn Verbindung wiederhergestellt
  watch(isOnline, (online) => {
    if (online) flushQueue()
  })

  return { saveScore, flushQueue, queue: queue.queue, isOnline }
}
