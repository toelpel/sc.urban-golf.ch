<template>
  <nav class="bottom-nav" :aria-label="$t('General.Home')">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :class="['bottom-nav__item', { 'is-active': isActive(item) }, item.feature && 'bottom-nav__item--feature']"
    >
      <span class="bottom-nav__icon-wrap">
        <component :is="isActive(item) ? item.iconSolid : item.icon" class="bottom-nav__icon" aria-hidden="true" />
      </span>
      <span class="bottom-nav__label">{{ $t(item.label) }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  HomeIcon as HomeOutline,
  RectangleStackIcon as GamesOutline,
  PlusCircleIcon as PlusOutline,
  InformationCircleIcon as AboutOutline,
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeSolid,
  RectangleStackIcon as GamesSolid,
  PlusCircleIcon as PlusSolid,
  InformationCircleIcon as AboutSolid,
} from '@heroicons/vue/24/solid'

type Item = {
  to: string
  label: string
  icon: typeof HomeOutline
  iconSolid: typeof HomeSolid
  match?: string
  feature?: boolean
}

const items: Item[] = [
  { to: '/', label: 'General.Home', icon: HomeOutline, iconSolid: HomeSolid, match: 'exact' },
  { to: '/games', label: 'General.Games', icon: GamesOutline, iconSolid: GamesSolid, match: 'startsWith:/games' },
  { to: '/games/new', label: 'General.NewGame', icon: PlusOutline, iconSolid: PlusSolid, feature: true },
  { to: '/about', label: 'About.Title', icon: AboutOutline, iconSolid: AboutSolid, match: 'startsWith:/about' },
]

const route = useRoute()

function isActive(item: Item) {
  if (item.match === 'exact') return route.path === item.to
  if (item.match?.startsWith('startsWith:')) {
    const prefix = item.match.split(':')[1]
    if (item.to === '/games' && route.path.startsWith('/games/new')) return false
    return route.path === prefix || route.path.startsWith(prefix + '/')
  }
  return route.path === item.to
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  height: calc(var(--spacing-nav-height) + var(--spacing-safe-bottom));
  padding-bottom: var(--spacing-safe-bottom);
  background: var(--nav-bg);
  backdrop-filter: saturate(1.4) blur(16px);
  -webkit-backdrop-filter: saturate(1.4) blur(16px);
  border-top: 1px solid var(--nav-border);
  box-shadow: 0 -8px 24px -12px rgb(0 0 0 / 0.15);
}

@media (min-width: 768px) {
  .bottom-nav { display: none; }
}

/* iOS-Performance: Blur weg, dafür opake Fläche */
@media (max-width: 480px) {
  .bottom-nav {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--card-bg);
  }
}

.bottom-nav__item {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.25rem 0.25rem 0.4rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 150ms;
  position: relative;
}

.bottom-nav__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2rem;
  border-radius: var(--radius-pill);
  transition: background 200ms var(--ease-standard);
}

.bottom-nav__icon {
  width: 1.5rem;
  height: 1.5rem;
}

.bottom-nav__label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1;
}

.bottom-nav__item.is-active {
  color: var(--primary);
}

.bottom-nav__item.is-active .bottom-nav__icon-wrap {
  background: color-mix(in oklab, var(--primary) 16%, transparent);
}

.bottom-nav__item:active .bottom-nav__icon-wrap {
  transform: scale(0.9);
  transition: transform 120ms var(--ease-spring);
}

.bottom-nav__item--feature .bottom-nav__icon-wrap {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  margin-top: -1.25rem;
  box-shadow: var(--shadow-elev-2), var(--shadow-glow-accent);
  border: 4px solid var(--nav-bg);
}

.bottom-nav__item--feature .bottom-nav__icon {
  width: 1.9rem;
  height: 1.9rem;
}

.bottom-nav__item--feature.is-active .bottom-nav__icon-wrap {
  background: var(--accent);
  color: var(--accent-ink);
}

.bottom-nav__item--feature {
  color: var(--text-default);
}

.bottom-nav__item--feature.is-active {
  color: var(--accent-ink);
}
</style>
