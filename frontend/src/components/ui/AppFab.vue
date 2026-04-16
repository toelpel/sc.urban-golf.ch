<template>
  <button
    type="button"
    class="fab"
    :class="[extended && 'fab--extended']"
    :aria-label="label"
    v-bind="$attrs"
  >
    <slot name="icon"></slot>
    <span v-if="extended" class="fab__label">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  label: string
  extended?: boolean
}>(), {
  extended: false,
})
</script>

<style scoped>
.fab {
  position: fixed;
  right: 1rem;
  bottom: calc(var(--spacing-nav-height) + var(--spacing-safe-bottom) + 1rem);
  z-index: 30;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 3.5rem;
  height: 3.5rem;
  padding: 0 1rem;
  border-radius: var(--radius-pill);
  background: var(--accent);
  color: var(--accent-ink);
  border: 0;
  box-shadow: var(--shadow-elev-3), var(--shadow-glow-accent);
  transition: transform 180ms var(--ease-spring), box-shadow 180ms var(--ease-standard);
  font-weight: 700;
}

@media (min-width: 768px) {
  .fab {
    bottom: 1.5rem;
    right: 1.5rem;
  }
}

.fab:active { transform: scale(0.95); }
.fab:hover { filter: brightness(1.05); }

.fab--extended { padding-inline: 1.1rem 1.3rem; }

.fab__label {
  font-size: var(--text-base);
  font-weight: 700;
  line-height: 1;
}
</style>
