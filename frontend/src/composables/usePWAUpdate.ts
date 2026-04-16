import { ref } from 'vue'

/**
 * Modul-Singleton: State ausserhalb der Funktion, damit main.ts und
 * PWAUpdateDialog.vue denselben State teilen.
 */
const showUpdateDialog = ref(false)
let _updateSW: ((reload?: boolean) => Promise<void>) | null = null

export function usePWAUpdate() {
  function onNeedRefresh(updateFn: (reload?: boolean) => Promise<void>) {
    _updateSW = updateFn
    showUpdateDialog.value = true
    // Kein Auto-Dismiss mehr — ein neuer Build soll bewusst vom User akzeptiert werden
  }

  /**
   * Wendet das neue Service-Worker Paket an und lädt die App neu.
   *
   * `vite-plugin-pwa`'s `updateSW(true)` macht den `skipWaiting`-Handshake
   * mit dem wartenden SW; der interne Reload läuft aber nur zuverlässig wenn
   * der `workbox-window`-Reload-Listener korrekt registriert ist. In unserer
   * injectManifest-Konfiguration ist das zeitabhängig → wir forcieren den
   * Reload als Safety Net selbst.
   */
  async function applyUpdate() {
    showUpdateDialog.value = false
    try {
      await _updateSW?.(true)
    } catch (err) {
      console.warn('[PWA] updateSW(true) failed, reloading manually:', err)
    }
    // Hard-Reload als Safety Net damit die neue Version auch wirklich geladen wird.
    // In Test-Environments (happy-dom) kann reload() throwen — safe-guardet mit try.
    if (typeof window !== 'undefined') {
      try { window.location.reload() } catch { /* ignore — test env */ }
    }
  }

  function dismissUpdate() {
    showUpdateDialog.value = false
  }

  return { showUpdateDialog, onNeedRefresh, applyUpdate, dismissUpdate }
}
