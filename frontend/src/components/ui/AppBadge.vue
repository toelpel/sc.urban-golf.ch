<template>
  <span :class="['badge', `badge--${variant}`, { 'badge--pill': pill }]">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'neutral' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
  pill?: boolean
}>(), {
  variant: 'neutral',
  pill: true,
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: var(--radius-sm);
  line-height: 1.1;
  background: color-mix(in oklab, var(--text-default) 10%, transparent);
  color: var(--text-default);
  white-space: nowrap;
}

.badge--pill { border-radius: var(--radius-pill); }

.badge--brand   { background: color-mix(in oklab, var(--primary) 16%, transparent); color: var(--primary); }
.badge--accent  { background: color-mix(in oklab, var(--accent) 18%, transparent); color: var(--accent); }
.badge--success { background: color-mix(in oklab, var(--color-success-500) 16%, transparent); color: var(--color-success-600); }
.badge--warning { background: color-mix(in oklab, var(--color-warning-500) 20%, transparent); color: var(--color-warning-600); }
.badge--danger  { background: color-mix(in oklab, var(--color-danger-500) 18%, transparent); color: var(--color-danger-500); }
.badge--info    { background: color-mix(in oklab, var(--color-info-500) 16%, transparent); color: var(--color-info-600); }

:where(.dark) .badge--success { color: var(--color-success-400); }
:where(.dark) .badge--warning { color: var(--color-warning-400); }
:where(.dark) .badge--danger  { color: var(--color-danger-400); }
:where(.dark) .badge--info    { color: var(--color-info-400); }
</style>
