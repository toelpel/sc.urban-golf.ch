<template>
  <button
    type="button"
    :class="['icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`]"
    :aria-label="label"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  label: string
  variant?: 'ghost' | 'solid' | 'soft' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}>(), {
  variant: 'ghost',
  size: 'md',
})
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  border: 1px solid transparent;
  color: var(--text-default);
  transition: background 150ms, color 150ms, border-color 150ms, transform 150ms var(--ease-spring);
}
.icon-btn:active { transform: scale(0.92); }
.icon-btn:disabled { opacity: 0.4; pointer-events: none; }

/* Tap-Target nie kleiner als 44 × 44 px (WCAG 2.5.5).
   Die `sm`-Variante hat ein engeres Icon-Padding aber bleibt 44 px gross. */
.icon-btn--sm { width: 2.75rem; height: 2.75rem; padding: 0.55rem; }
.icon-btn--md { width: 2.75rem; height: 2.75rem; }
.icon-btn--lg { width: 3.25rem; height: 3.25rem; }

.icon-btn--ghost:hover { background: color-mix(in oklab, var(--text-default) 8%, transparent); color: var(--text-strong); }
.icon-btn--solid { background: var(--primary); color: var(--primary-ink); }
.icon-btn--solid:hover { background: var(--primary-hover); }
.icon-btn--soft { background: color-mix(in oklab, var(--primary) 14%, transparent); color: var(--primary); }
.icon-btn--soft:hover { background: color-mix(in oklab, var(--primary) 22%, transparent); }
.icon-btn--outline { border-color: var(--card-border); color: var(--text-default); }
.icon-btn--outline:hover { border-color: var(--primary); color: var(--primary); }
</style>
