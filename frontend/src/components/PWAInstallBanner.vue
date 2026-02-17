<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div
        v-if="showBanner"
        role="dialog"
        aria-modal="true"
        :aria-label="$t('PWA.InstallBanner.Title')"
        class="fixed bottom-0 left-0 right-0 z-[200]
               bg-gray-900/97 text-white backdrop-blur-md
               px-4 pt-5 pb-8 shadow-2xl border-t border-white/10"
      >
        <!-- Schliessen / Nicht mehr anzeigen -->
        <button
          @click="dismissPermanently"
          class="absolute top-3 right-3 text-gray-400 hover:text-white text-xs underline transition"
        >
          {{ $t('PWA.InstallBanner.DontShowAgain') }}
        </button>

        <!-- Android: nativer Install-Prompt -->
        <div v-if="isAndroid" class="max-w-sm mx-auto">
          <p class="font-semibold text-base mb-1">{{ $t('PWA.InstallBanner.Title') }}</p>
          <p class="text-sm text-gray-300 mb-5">{{ $t('PWA.InstallBanner.Description') }}</p>
          <div class="flex gap-3">
            <button
              @click="triggerInstall"
              class="button-primary flex-1 text-center"
            >
              {{ $t('PWA.InstallBanner.Install') }}
            </button>
            <button
              @click="dismiss"
              class="flex-1 text-center px-4 py-2 rounded-xl border border-white/30
                     text-white hover:bg-white/10 transition text-sm font-medium"
            >
              {{ $t('PWA.InstallBanner.NotNow') }}
            </button>
          </div>
        </div>

        <!-- iOS: Manuelle Anleitung -->
        <div v-else-if="isIOS" class="max-w-sm mx-auto">
          <p class="font-semibold text-base mb-1">{{ $t('PWA.InstallBanner.Title') }}</p>
          <ol class="text-sm text-gray-300 space-y-2 mb-5 list-decimal list-inside">
            <li>{{ $t('PWA.InstallBanner.IOSStep1') }}</li>
            <li>{{ $t('PWA.InstallBanner.IOSStep2') }}</li>
            <li>{{ $t('PWA.InstallBanner.IOSStep3') }}</li>
          </ol>
          <button @click="dismiss" class="button-primary w-full text-center">
            {{ $t('PWA.InstallBanner.GotIt') }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLocalStorage } from '@vueuse/core'

const SHOW_DELAY_MS = 30_000

const visitCount = useLocalStorage<number>('ug-install-visits', 0)
const dismissed = useLocalStorage<boolean>('ug-install-dismissed', false)

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

function dismiss() {
  showBanner.value = false
}

function dismissPermanently() {
  dismissed.value = true
  showBanner.value = false
}

async function triggerInstall() {
  if (!deferredPrompt) return
  const prompt = deferredPrompt as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> }
  prompt.prompt()
  const { outcome } = await prompt.userChoice
  if (outcome === 'accepted') {
    dismissed.value = true
  }
  deferredPrompt = null
  showBanner.value = false
}

onMounted(() => {
  // Nicht anzeigen wenn: bereits dismissed, bereits installiert (standalone), oder erster Besuch
  if (dismissed.value || isStandaloneMode()) return

  visitCount.value += 1
  if (visitCount.value < 2) return

  // Android: beforeinstallprompt abfangen
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    isAndroid.value = true
    setTimeout(() => {
      if (!dismissed.value) showBanner.value = true
    }, SHOW_DELAY_MS)
  })

  // iOS: kein beforeinstallprompt – über UA erkennen
  if (isIOSDevice() && !isStandaloneMode()) {
    isIOS.value = true
    setTimeout(() => {
      if (!dismissed.value) showBanner.value = true
    }, SHOW_DELAY_MS)
  }
})
</script>

<style scoped>
.slide-up-enter-active {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-up-leave-active {
  transition: transform 0.3s ease-in;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
