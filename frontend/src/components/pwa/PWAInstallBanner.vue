<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="showBanner"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('PWA.InstallBanner.Title')"
        class="install-banner"
      >
        <button
          @click="dismissPermanently"
          class="install-banner__skip"
        >
          {{ $t('PWA.InstallBanner.DontShowAgain') }}
        </button>

        <div class="install-banner__inner">
          <div class="install-banner__icon">
            <ArrowDownTrayIcon class="w-6 h-6" />
          </div>

          <!-- Android -->
          <div v-if="isAndroid" class="install-banner__content">
            <h3 class="t-subtitle" style="color: var(--text-inverted)">
              {{ $t('PWA.InstallBanner.Title') }}
            </h3>
            <p class="install-banner__desc">{{ $t('PWA.InstallBanner.Description') }}</p>
            <div class="install-banner__actions">
              <AppButton variant="accent" size="md" pill @click="triggerInstall">
                {{ $t('PWA.InstallBanner.Install') }}
              </AppButton>
              <button
                @click="dismiss"
                class="install-banner__later"
              >
                {{ $t('PWA.InstallBanner.NotNow') }}
              </button>
            </div>
          </div>

          <!-- iOS -->
          <div v-else-if="isIOS" class="install-banner__content">
            <h3 class="t-subtitle" style="color: var(--text-inverted)">
              {{ $t('PWA.InstallBanner.Title') }}
            </h3>
            <ol class="install-banner__steps">
              <li>{{ $t('PWA.InstallBanner.IOSStep1') }}</li>
              <li>{{ $t('PWA.InstallBanner.IOSStep2') }}</li>
              <li>{{ $t('PWA.InstallBanner.IOSStep3') }}</li>
            </ol>
            <AppButton variant="accent" size="md" block pill @click="dismiss">
              {{ $t('PWA.InstallBanner.GotIt') }}
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import AppButton from '@/components/ui/AppButton.vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

// Fallback-Delay wenn nichts Besseres bekannt ist
const FALLBACK_DELAY_MS = 60_000
// Nach dem ersten Game-Start den User kurz spielen lassen, dann prompten
const POST_GAMESTART_DELAY_MS = 8_000

const visitCount = useLocalStorage<number>('ug-install-visits', 0)
const dismissed = useLocalStorage<boolean>('ug-install-dismissed', false)
const gameStartedAt = useLocalStorage<number>('ug-install-gamestart', 0)

const showBanner = ref(false)
const isAndroid = ref(false)
const isIOS = ref(false)
let deferredPrompt: Event | null = null

function isIOSDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
}

function dismiss() { showBanner.value = false }
function dismissPermanently() { dismissed.value = true; showBanner.value = false }

async function triggerInstall() {
  if (!deferredPrompt) return
  const prompt = deferredPrompt as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> }
  prompt.prompt()
  const { outcome } = await prompt.userChoice
  if (outcome === 'accepted') dismissed.value = true
  deferredPrompt = null
  showBanner.value = false
}

/**
 * Gute Prompt-Gelegenheiten (in abnehmender Priorität):
 *   1) User hat gerade ein neues Spiel gestartet → er hat gerade Investition getätigt,
 *      die App zu behalten ist attraktiv (kurze Verzögerung um ihn erst den ersten
 *      Score eintragen zu lassen)
 *   2) Fallback: nach 60 s Browser-Zeit — weniger invasiv als 30 s
 */
function scheduleShow() {
  const ts = gameStartedAt.value
  const hasRecentGameStart = ts > 0 && Date.now() - ts < 24 * 60 * 60 * 1000
  const delay = hasRecentGameStart ? POST_GAMESTART_DELAY_MS : FALLBACK_DELAY_MS
  setTimeout(() => { if (!dismissed.value) showBanner.value = true }, delay)
}

onMounted(() => {
  if (dismissed.value || isStandaloneMode()) return
  visitCount.value += 1
  if (visitCount.value < 2) return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    isAndroid.value = true
    scheduleShow()
  })

  if (isIOSDevice() && !isStandaloneMode()) {
    isIOS.value = true
    scheduleShow()
  }
})
</script>

<style scoped>
.install-banner {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  padding: 1.25rem 1rem calc(1.75rem + var(--spacing-safe-bottom));
  background: linear-gradient(165deg, var(--color-surface-900) 0%, var(--color-surface-950) 100%);
  color: var(--text-inverted);
  border-top: 1px solid color-mix(in oklab, white 10%, transparent);
  box-shadow: 0 -16px 40px -12px rgb(0 0 0 / 0.4);
}

.install-banner__skip {
  position: absolute;
  top: 0.75rem;
  right: 0.9rem;
  background: transparent;
  border: 0;
  color: color-mix(in oklab, white 60%, transparent);
  font-size: var(--text-xs);
  text-decoration: underline;
}

.install-banner__inner {
  max-width: 28rem;
  margin-inline: auto;
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}

.install-banner__icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 999px;
  background: color-mix(in oklab, var(--accent) 90%, transparent);
  color: var(--accent-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.install-banner__content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  min-width: 0;
  flex: 1 1 auto;
}

.install-banner__desc {
  font-size: var(--text-sm);
  color: color-mix(in oklab, white 80%, transparent);
}

.install-banner__actions {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.install-banner__later {
  padding: 0.55rem 1rem;
  border-radius: var(--radius-pill);
  border: 1px solid color-mix(in oklab, white 30%, transparent);
  background: transparent;
  color: var(--text-inverted);
  font-weight: 500;
  font-size: var(--text-sm);
}
.install-banner__later:hover {
  background: color-mix(in oklab, white 10%, transparent);
}

.install-banner__steps {
  list-style: decimal;
  padding-left: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: var(--text-sm);
  color: color-mix(in oklab, white 80%, transparent);
  margin-block: 0.25rem 0.5rem;
}

.slide-up-enter-active { transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.slide-up-leave-active { transition: transform 0.3s ease-in; }
.slide-up-enter-from,
.slide-up-leave-to { transform: translateY(100%); }
</style>
