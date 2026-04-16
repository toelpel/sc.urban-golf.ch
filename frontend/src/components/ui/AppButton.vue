<template>
  <component
    :is="tag"
    :type="tag === 'button' ? (type || 'button') : undefined"
    :class="[
      'app-btn',
      `app-btn--${variant}`,
      `app-btn--${size}`,
      { 'app-btn--block': block, 'app-btn--pill': pill, 'app-btn--loading': loading },
    ]"
    :disabled="tag === 'button' ? (disabled || loading) : undefined"
    :aria-busy="loading || undefined"
    v-bind="$attrs"
  >
    <span v-if="loading" class="app-btn__spinner" aria-hidden="true"></span>
    <slot name="icon-left"></slot>
    <span class="app-btn__label"><slot></slot></span>
    <slot name="icon-right"></slot>
  </component>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tag?: 'button' | 'a' | 'router-link'
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  pill?: boolean
  loading?: boolean
  disabled?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  tag: 'button',
  type: 'button',
  block: false,
  pill: false,
  loading: false,
  disabled: false,
})
</script>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  letter-spacing: -0.005em;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: background 150ms var(--ease-standard),
              color 150ms var(--ease-standard),
              border-color 150ms var(--ease-standard),
              box-shadow 150ms var(--ease-standard),
              transform 150ms var(--ease-spring);
  user-select: none;
  white-space: nowrap;
  text-decoration: none;
}
.app-btn:disabled,
.app-btn[aria-disabled='true'] {
  opacity: 0.5;
  pointer-events: none;
}
.app-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.99);
}

/* Variants */
.app-btn--primary {
  background: var(--primary);
  color: var(--primary-ink);
  box-shadow: var(--shadow-elev-1);
}
.app-btn--primary:hover {
  background: var(--primary-hover);
  box-shadow: var(--shadow-elev-2);
}

.app-btn--secondary {
  background: var(--card-bg);
  color: var(--text-strong);
  border-color: var(--card-border);
}
.app-btn--secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.app-btn--ghost {
  background: transparent;
  color: var(--text-default);
}
.app-btn--ghost:hover {
  background: color-mix(in oklab, var(--text-default) 8%, transparent);
  color: var(--text-strong);
}

.app-btn--danger {
  background: var(--color-danger-500);
  color: #fff;
  box-shadow: var(--shadow-elev-1);
}
.app-btn--danger:hover { background: var(--color-danger-600); }

.app-btn--accent {
  background: var(--accent);
  color: var(--accent-ink);
  box-shadow: var(--shadow-glow-accent);
}
.app-btn--accent:hover { filter: brightness(1.05); }

/* Sizes */
/* WCAG 2.5.5: Mindest-Tap-Target 44 px. `sm` setzt kompakteres Padding aber
   hebt die Höhe nicht unter 44 px. */
.app-btn--sm { padding: 0.45rem 0.85rem; font-size: var(--text-sm); min-height: 2.75rem; }
.app-btn--md { padding: 0.65rem 1.25rem; font-size: var(--text-base); min-height: 2.75rem; }
.app-btn--lg { padding: 0.85rem 1.5rem; font-size: var(--text-lg); min-height: 3.25rem; }
.app-btn--xl { padding: 1.1rem 1.75rem; font-size: var(--text-lg); min-height: 3.75rem; }

.app-btn--block { width: 100%; }
.app-btn--pill { border-radius: var(--radius-pill); }

.app-btn--loading { pointer-events: none; }
.app-btn__label { line-height: 1; }

.app-btn__spinner {
  width: 1rem;
  height: 1rem;
  border-radius: 999px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: app-btn-spin 700ms linear infinite;
}

@keyframes app-btn-spin {
  to { transform: rotate(360deg); }
}
</style>
