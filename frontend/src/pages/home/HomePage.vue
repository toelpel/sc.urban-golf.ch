<template>
  <DefaultLayout>
    <div class="container-app home">
      <!-- Hero -->
      <section class="home-hero">
        <span class="t-eyebrow">{{ $t('Home.Subtitle') }}</span>
        <h1 class="home-hero__title">ScoreCard</h1>
        <p class="t-body home-hero__lead">
          {{ $t('Home.Text') }}
        </p>

        <div class="home-hero__actions">
          <AppButton variant="accent" size="xl" block pill @click="$router.push('/games/new')">
            <template #icon-left>
              <PlusIcon class="w-5 h-5" />
            </template>
            {{ $t('General.NewGame') }}
          </AppButton>

          <AppButton variant="secondary" size="xl" block pill @click="$router.push('/games')">
            <template #icon-left>
              <RectangleStackIcon class="w-5 h-5" />
            </template>
            {{ $t('General.Games') }}
          </AppButton>
        </div>
      </section>

      <!-- Letzte Spiele -->
      <section v-if="recent.length || loading" class="home-section">
        <header class="home-section__header">
          <h2 class="t-title">{{ $t('Home.RecentGames') }}</h2>
          <router-link to="/games" class="home-section__link">
            {{ $t('Home.SeeAll') }}
            <ArrowRightIcon class="w-4 h-4" />
          </router-link>
        </header>

        <div v-if="loading" class="home-scroller">
          <div v-for="i in 3" :key="i" class="home-game-card home-game-card--skeleton"></div>
        </div>

        <div v-else class="home-scroller scroll-hide" role="list">
          <router-link
            v-for="game in recent"
            :key="game.id"
            :to="`/games/${game.id}`"
            class="home-game-card"
            role="listitem"
          >
            <div class="home-game-card__head">
              <AppBadge variant="brand">
                {{ holeCountLabel(game.holes?.length || 0) }}
              </AppBadge>
              <span v-if="game.created_at" class="t-muted home-game-card__date">
                {{ formatShortDate(game.created_at) }}
              </span>
            </div>
            <h3 class="home-game-card__name">{{ shortGameName(game.name, 40) }}</h3>
            <div class="home-game-card__foot">
              <div class="home-game-card__avatars">
                <PlayerAvatar
                  v-for="(p, idx) in (game.players || []).slice(0, 4)"
                  :key="p.id"
                  :name="p.name"
                  :color="playerColor(idx)"
                  size="sm"
                />
                <span
                  v-if="(game.players?.length || 0) > 4"
                  class="home-game-card__more"
                >
                  +{{ (game.players!.length - 4) }}
                </span>
              </div>
              <span class="home-game-card__leader" v-if="leader(game)">
                🏆 {{ leader(game) }}
              </span>
            </div>
          </router-link>
        </div>
      </section>

    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import PlayerAvatar from '@/components/ui/PlayerAvatar.vue'
import {
  PlusIcon,
  RectangleStackIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import { useGamesSummaryData } from '@/composables/useGamesSummaryData'
import { shortGameName } from '@/utils/format'
import type { GameSummary, PlayerWithStats } from '@/services/api'

const { t } = useI18n()
const { games, loadGames, error } = useGamesSummaryData()
const loading = computed(() => games.value.length === 0 && !error.value)

function holeCountLabel(n: number): string {
  return n === 1 ? t('General.HoleOne', { n }) : t('General.HoleMany', { n })
}

const playerColors = [
  'var(--color-player-1)',
  'var(--color-player-2)',
  'var(--color-player-3)',
  'var(--color-player-4)',
  'var(--color-player-5)',
  'var(--color-player-6)',
  'var(--color-player-7)',
  'var(--color-player-8)',
]

function playerColor(idx: number) {
  return playerColors[idx % playerColors.length]
}

const recent = computed<GameSummary[]>(() => games.value.slice(0, 6))

function leader(game: GameSummary): string | null {
  const players = (game.players || []).filter(
    (p): p is PlayerWithStats & { total: number } => typeof p.total === 'number'
  )
  if (!players.length) return null
  const sorted = [...players].sort((a, b) => a.total - b.total)
  return sorted[0].name
}

function formatShortDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: 'short' })
}

onMounted(() => loadGames({ perPage: 6 }))
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  /* Nur oben Padding — unten reserviert .app-main bereits Platz für die Bottom-Nav.
     Doppeltes Bottom-Padding erzeugt sonst einen unnötigen vertikalen Scroll. */
  padding-block: 1.5rem 0;
}

/* =====================================================================
   Hero — animierter, lebendiger Glas-Card Look
   ===================================================================== */

.home-hero {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.75rem 1.5rem 1.75rem;
  border-radius: var(--radius-xl);
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-elev-1);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

/* Aurora-Layer: rotierendes Conic-Gradient mit starkem Blur
   Alle Stops bewegen sich in der Brand- + Accent-Familie, damit die
   Komposition mit dem Logo harmoniert. */
.home-hero::before {
  content: "";
  position: absolute;
  inset: -50%;
  z-index: -2;
  background: conic-gradient(
    from 0deg at 50% 50%,
    color-mix(in oklab, var(--color-brand-500) 40%, transparent) 0deg,
    color-mix(in oklab, var(--color-accent-500) 35%, transparent) 100deg,
    color-mix(in oklab, var(--color-brand-700) 28%, transparent) 200deg,
    color-mix(in oklab, var(--color-brand-300) 28%, transparent) 290deg,
    color-mix(in oklab, var(--color-brand-500) 40%, transparent) 360deg
  );
  filter: blur(46px) saturate(1.25);
  opacity: 0.6;
  animation: hero-aurora 28s linear infinite;
  pointer-events: none;
}

/* Treibender Lime-Orb oben-rechts */
.home-hero::after {
  content: "";
  position: absolute;
  top: -25%;
  right: -15%;
  width: 70%;
  height: 70%;
  z-index: -1;
  background: radial-gradient(
    circle at center,
    color-mix(in oklab, var(--accent) 55%, transparent) 0%,
    color-mix(in oklab, var(--accent) 20%, transparent) 40%,
    transparent 70%
  );
  filter: blur(8px);
  animation: hero-orb 18s ease-in-out infinite;
  pointer-events: none;
  will-change: transform, opacity;
}

.home-hero > * { position: relative; z-index: 1; }

@keyframes hero-aurora {
  to { transform: rotate(360deg); }
}

@keyframes hero-orb {
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.9;
  }
  33% {
    transform: translate3d(-14%, 18%, 0) scale(1.15);
    opacity: 1;
  }
  66% {
    transform: translate3d(6%, 34%, 0) scale(0.95);
    opacity: 0.7;
  }
}

/* =====================================================================
   Titel mit fließendem Gradient ("shine through")
   ===================================================================== */
.home-hero__title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 12vw, 4rem);
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.035em;
  white-space: nowrap;
  background-image: linear-gradient(
    100deg,
    var(--text-strong) 0%,
    var(--text-strong) 18%,
    var(--primary) 38%,
    var(--accent) 50%,
    var(--primary) 62%,
    var(--text-strong) 82%,
    var(--text-strong) 100%
  );
  background-size: 280% 100%;
  background-position: 0% 50%;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: title-flow 7s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}

@keyframes title-flow {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* =====================================================================
   Respect reduced motion
   ===================================================================== */
@media (prefers-reduced-motion: reduce) {
  .home-hero::before,
  .home-hero::after,
  .home-hero__title {
    animation: none;
  }
  .home-hero__title {
    background-position: 50% 50%;
  }
}

.home-hero__lead {
  max-width: 36rem;
}

.home-hero__actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

@media (min-width: 640px) {
  .home-hero { padding: 2.25rem; }
  .home-hero__actions { flex-direction: row; }
  .home-hero__actions :deep(.app-btn) { flex: 1 1 0; }
}

/* Section */
.home-section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.home-section__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.home-section__link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
}
.home-section__link:hover { text-decoration: underline; }

/* Recent games scroller — hält immer einen Teil der nächsten Card sichtbar
   damit die Scrollbarkeit auf allen Viewports erkennbar bleibt. */
.home-scroller {
  display: flex;
  gap: 0.85rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding-bottom: 0.25rem;
  margin-inline: -1rem;
  /* rechtes Padding zeigt, dass rechts noch mehr kommt */
  padding-inline: 1rem 2.5rem;
  scroll-padding-inline: 1rem;
}

.home-game-card {
  scroll-snap-align: start;
  /* Max 85% Breite — so bleibt rechts immer etwas von der nächsten Card sichtbar */
  flex: 0 0 min(78vw, 19rem);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.1rem;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow-elev-1);
  color: var(--text-strong);
  text-decoration: none;
  transition: box-shadow 180ms, transform 150ms var(--ease-spring);
}
.home-game-card:hover { box-shadow: var(--shadow-elev-2); }
.home-game-card:active { transform: translateY(1px); }

.home-game-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.home-game-card__date {
  font-size: var(--text-xs);
}

.home-game-card__name {
  font-size: var(--text-lg);
  font-weight: 700;
  letter-spacing: -0.01em;
}

.home-game-card__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
}

.home-game-card__avatars {
  display: flex;
  align-items: center;
}
.home-game-card__avatars :deep(.avatar) { margin-left: -0.5rem; }
.home-game-card__avatars :deep(.avatar):first-child { margin-left: 0; }

.home-game-card__more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: color-mix(in oklab, var(--text-default) 10%, transparent);
  color: var(--text-default);
  font-size: var(--text-xs);
  font-weight: 700;
  margin-left: -0.5rem;
  border: 2px solid var(--card-bg);
}

.home-game-card__leader {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--text-muted);
  display: inline-flex;
  gap: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 50%;
}

.home-game-card--skeleton {
  background: color-mix(in oklab, var(--text-default) 8%, transparent);
  min-height: 9rem;
  animation: shimmer 1.6s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 0.9; }
}

/* OpenSource card */
.home-oss {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  text-decoration: none;
  color: var(--text-strong);
}

.home-oss__icon {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--text-strong);
  color: var(--card-bg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-oss__body { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }

.home-oss__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.4rem;
  font-weight: 600;
  color: var(--primary);
}
</style>
