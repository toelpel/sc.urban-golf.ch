<template>
  <div role="alert" aria-live="assertive" class="error-state card card--padded">
    <div class="error-state__icon">
      <ExclamationTriangleIcon class="w-8 h-8" aria-hidden="true" />
    </div>
    <div class="error-state__body">
      <h2 class="t-subtitle">{{ title || $t('Errors.LoadingFailed') }}</h2>
      <p v-if="message" class="t-body t-muted">{{ message }}</p>
    </div>
    <AppButton v-if="onRetry" variant="primary" size="md" @click="onRetry">
      {{ $t('Errors.Retry') }}
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import AppButton from './AppButton.vue'

defineProps<{
  title?: string
  message?: string | null
  onRetry?: () => void | Promise<void>
}>()
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  text-align: center;
  padding: 1.75rem;
}

.error-state__icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in oklab, var(--color-danger-500) 14%, transparent);
  color: var(--color-danger-500);
}

.error-state__body > * + * { margin-top: 0.35rem; }
</style>
