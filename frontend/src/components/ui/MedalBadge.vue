<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 48 48`"
    :class="['medal', `medal--${variant}`]"
    role="img"
    :aria-label="ariaLabel"
  >
    <!-- Band links + rechts -->
    <path d="M 12 4 L 20 22 L 12 22 Z" class="medal__band medal__band--left" />
    <path d="M 36 4 L 28 22 L 36 22 Z" class="medal__band medal__band--right" />

    <!-- Medaille -->
    <circle cx="24" cy="30" r="14" class="medal__disc" />
    <circle cx="24" cy="30" r="10.5" class="medal__ring" fill="none" />

    <!-- Rang-Zahl -->
    <text
      x="24"
      y="30"
      text-anchor="middle"
      dominant-baseline="central"
      class="medal__rank"
    >{{ rank }}</text>

    <!-- subtile Glanz-Kante oben -->
    <path
      d="M 14 27 A 10 10 0 0 1 34 27"
      stroke-width="1.2"
      fill="none"
      class="medal__shine"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  rank: 1 | 2 | 3
  size?: number
  label?: string
}>(), {
  size: 40,
})

const variant = computed(() => {
  if (props.rank === 1) return 'gold'
  if (props.rank === 2) return 'silver'
  return 'bronze'
})

const ariaLabel = computed(() => props.label ?? `Rank ${props.rank}`)
</script>

<style scoped>
.medal { display: inline-block; flex-shrink: 0; }

/* Brand-Bänder: Primary-Grün links, Accent-Navy rechts — integriert die
   Medaille visuell in die Greenway-Palette statt rot/blau als Fremdfarben.
   Nicht zu dunkel, damit die Medaille auf den hellen Podium-Pillars
   nicht „schwer" wirkt. */
.medal__band--left { fill: var(--color-brand-600); }
.medal__band--right { fill: var(--color-accent-500); }

:root.dark .medal__band--left { fill: var(--color-brand-500); }
:root.dark .medal__band--right { fill: var(--color-accent-400); }

.medal__disc { stroke-width: 1.5; }
.medal__ring { stroke-width: 1.3; opacity: 0.55; }
.medal__shine { opacity: 0.45; }

.medal__rank {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
  fill: var(--color-surface-900);
}

/* Gold */
.medal--gold .medal__disc {
  fill: #f8d675;
  stroke: #a67a1c;
}
.medal--gold .medal__ring { stroke: #7a5a10; }
.medal--gold .medal__shine { stroke: #fef3c6; }

/* Silver */
.medal--silver .medal__disc {
  fill: #dfe2e8;
  stroke: #8b93a0;
}
.medal--silver .medal__ring { stroke: #5e6573; }
.medal--silver .medal__shine { stroke: #ffffff; }

/* Bronze */
.medal--bronze .medal__disc {
  fill: #d89a6b;
  stroke: #8c5a2f;
}
.medal--bronze .medal__ring { stroke: #6b4216; }
.medal--bronze .medal__shine { stroke: #f4d9c2; }
</style>
