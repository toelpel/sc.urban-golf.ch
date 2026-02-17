<template>
  <Teleport to="body">
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm"
         role="alert" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id"
             class="px-4 py-3 rounded-xl shadow-lg backdrop-blur-md text-sm font-medium flex items-center gap-2"
             :class="toastClass(toast.type)">
          <span class="flex-1">{{ toast.message }}</span>
          <button @click="dismiss(toast.id)"
                  class="shrink-0 opacity-70 hover:opacity-100 transition"
                  aria-label="Dismiss notification">&times;</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

function toastClass(type) {
  const map = {
    success: 'bg-green-600/90 text-white',
    error: 'bg-red-600/90 text-white',
    warning: 'bg-yellow-500/90 text-gray-900',
    info: 'bg-gray-800/90 text-white dark:bg-gray-700/90',
  }
  return map[type] || map.info
}
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-12px); }
.toast-leave-to { opacity: 0; transform: translateY(-8px) scale(0.95); }
</style>
