<template>
  <div role="alert" aria-live="assertive"
    class="glass-card p-6 flex flex-col items-center gap-4 text-center">
    <ExclamationTriangleIcon class="w-10 h-10 text-rose-500 dark:text-rose-400" aria-hidden="true" />
    <div class="space-y-1">
      <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100">
        {{ title || $t('Errors.LoadingFailed') }}
      </h2>
      <p v-if="message" class="text-sm text-gray-600 dark:text-gray-300 break-words">
        {{ message }}
      </p>
    </div>
    <button v-if="onRetry" type="button" class="button-primary" @click="onRetry">
      {{ $t('Errors.Retry') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps<{
  title?: string
  message?: string | null
  onRetry?: () => void | Promise<void>
}>()
</script>
