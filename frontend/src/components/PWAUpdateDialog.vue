<template>
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="showUpdateDialog"
        role="alert"
        class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[150]
               bg-gray-800 text-white px-4 py-3 rounded-2xl shadow-lg
               flex items-center gap-3 w-[90vw] max-w-sm"
      >
        <span class="text-sm flex-1">{{ $t('PWA.UpdateAvailable') }}</span>
        <button
          @click="applyUpdate"
          class="shrink-0 text-sm underline hover:text-gray-300 transition"
        >
          {{ $t('PWA.Reload') }}
        </button>
        <button
          @click="dismissUpdate"
          class="shrink-0 opacity-60 hover:opacity-100 transition text-lg leading-none"
          aria-label="Schliessen"
        >
          &times;
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { usePWAUpdate } from '@/composables/usePWAUpdate'

const { showUpdateDialog, applyUpdate, dismissUpdate } = usePWAUpdate()
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px) scale(0.95);
}
</style>
