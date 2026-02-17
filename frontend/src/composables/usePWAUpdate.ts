import { ref } from 'vue'

// Modul-Singleton: State ausserhalb der Funktion, damit main.js und
// PWAUpdateDialog.vue denselben State teilen.
const showUpdateDialog = ref(false)
let _updateSW: ((reload?: boolean) => Promise<void>) | null = null

export function usePWAUpdate() {
  function onNeedRefresh(updateFn: (reload?: boolean) => Promise<void>) {
    _updateSW = updateFn
    showUpdateDialog.value = true
    // Nach 20s automatisch ausblenden
    setTimeout(() => {
      showUpdateDialog.value = false
    }, 20_000)
  }

  async function applyUpdate() {
    showUpdateDialog.value = false
    await _updateSW?.(true)
  }

  function dismissUpdate() {
    showUpdateDialog.value = false
  }

  return { showUpdateDialog, onNeedRefresh, applyUpdate, dismissUpdate }
}
