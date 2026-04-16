<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    class="progress-ring"
    role="img"
    :aria-label="label"
  >
    <circle
      class="progress-ring__track"
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
      :stroke-width="stroke"
      fill="none"
    />
    <circle
      class="progress-ring__indicator"
      :cx="size / 2"
      :cy="size / 2"
      :r="radius"
      :stroke-width="stroke"
      fill="none"
      :stroke-dasharray="circumference"
      :stroke-dashoffset="offset"
      stroke-linecap="round"
    />
    <foreignObject x="0" y="0" :width="size" :height="size">
      <div class="progress-ring__content">
        <slot></slot>
      </div>
    </foreignObject>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  value: number
  max?: number
  size?: number
  stroke?: number
  label: string
}>(), {
  max: 100,
  size: 220,
  stroke: 14,
})

const radius = computed(() => (props.size - props.stroke) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => {
  const ratio = Math.max(0, Math.min(1, props.value / (props.max || 1)))
  return circumference.value * (1 - ratio)
})
</script>

<style scoped>
.progress-ring {
  display: block;
  transform: rotate(-90deg);
}

.progress-ring__track {
  stroke: color-mix(in oklab, var(--text-default) 12%, transparent);
}

.progress-ring__indicator {
  stroke: var(--primary);
  transition: stroke-dashoffset 400ms var(--ease-emphasize);
  filter: drop-shadow(0 0 8px color-mix(in oklab, var(--primary) 30%, transparent));
}

.progress-ring__content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(90deg);
  transform-origin: center;
}
</style>
