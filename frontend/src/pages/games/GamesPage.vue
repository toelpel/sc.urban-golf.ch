<template>
  <DefaultLayout>
    <template v-if="!hasValidGameId">
      <GamesListCompact />
    </template>

    <template v-else>
      <div class="container-app games-detail">
        <ErrorState v-if="error" :message="error" :on-retry="reload" />
        <GamesHoleView v-else-if="isHoleView" />

        <template v-else>
          <header class="games-detail__header">
            <div class="games-detail__title-row">
              <h1 class="t-title games-detail__title" :title="gameName">
                {{ displayName }}
              </h1>
              <AppIconButton
                :label="$t('Games.HoleView.EditGame')"
                variant="outline"
                size="md"
                @click="$router.push(`/games/new/${gameId}`)"
              >
                <PencilSquareIcon class="w-5 h-5" />
              </AppIconButton>
            </div>

            <SegmentedControl
              v-model="viewMode"
              :options="viewOptions"
              label="Ansicht"
              block
            />

            <!-- Direkter Loch-Zugriff auf allen drei Views — gleiche Chip-Leiste
                 wie in der Hole-View, macht das Navigieren zwischen Löchern
                 konsistent und schnell. -->
            <div v-if="holes.length" class="games-detail__holes scroll-hide" role="list">
              <router-link
                v-for="n in holes"
                :key="n"
                :to="`/games/${gameId}/${n}`"
                class="games-detail__hole-chip"
                role="listitem"
              >
                {{ n }}
              </router-link>
              <router-link
                :to="`/games/${gameId}/${nextNewHole}`"
                class="games-detail__hole-chip games-detail__hole-chip--add"
                :aria-label="$t('General.Hole') + ' +1'"
              >
                <PlusIcon class="w-3.5 h-3.5" />
              </router-link>
            </div>
          </header>

          <GamesDetailSkeleton v-if="players.length === 0" :rows="4" :columns="6" />

          <div v-else class="games-detail__body">
            <Transition name="view-fade" mode="out-in">
              <GamesDetailRanking
                v-if="viewMode === 'ranking'"
                key="ranking"
                :sort-column="sortColumn"
                :sort-direction="sortDirection"
                :sorted-players="sortedPlayers"
                :average-score="averageScore"
                :total-score="totalScore"
                @sort="sortBy"
              />
              <GamesDetailHorizontal
                v-else-if="viewMode === 'horizontal'"
                key="horizontal"
                :players="sortedPlayers"
                :holes="holes"
                :scores="scores"
                :game-id="gameId"
                :sort-column="sortColumn"
                :sort-direction="sortDirection"
                :sorted-players="sortedPlayers"
                :average-score="averageScore"
                :total-score="totalScore"
                @sort="sortBy"
              />
              <GamesDetailVertical
                v-else
                key="vertical"
                :players="sortedPlayers"
                :holes="holes"
                :scores="scores"
                :game-id="gameId"
                :sort-column="sortColumn"
                :sort-direction="sortDirection"
                :sorted-players="sortedPlayers"
                :average-score="averageScore"
                :total-score="totalScore"
                @sort="sortBy"
              />
            </Transition>
          </div>
        </template>
      </div>
    </template>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import GamesListCompact from '@/components/games/GamesListCompact.vue'
import GamesDetailHorizontal from '@/components/games/GamesDetailHorizontal.vue'
import GamesDetailVertical from '@/components/games/GamesDetailVertical.vue'
import GamesDetailRanking from '@/components/games/GamesDetailRanking.vue'
import GamesDetailSkeleton from '@/components/games/GamesDetailSkeleton.vue'
import GamesHoleView from '@/components/games/GamesHoleView.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'

import { TrophyIcon, TableCellsIcon, ListBulletIcon, PencilSquareIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { computed, provide, watchEffect, markRaw } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useGamesDetailData } from '@/composables/useGamesDetailData'
import { useSortedPlayers } from '@/composables/useSortedPlayers'
import { useViewMode } from '@/composables/useViewMode'
import { gamesDetailKey } from '@/types'
import { shortGameName } from '@/utils/format'
import { VALIDATION } from '@/constants'

const route = useRoute()
const { t } = useI18n()
const gameId = computed(() => route.params.gameId as string)
const hasValidGameId = computed(() =>
  typeof gameId.value === 'string' && /^[a-zA-Z0-9_-]{10,30}$/.test(gameId.value)
)
const isHoleView = computed(() => 'holeId' in route.params)

const { players, scores, holes, gameName, error, load: loadGamesDetailData } = useGamesDetailData(gameId)

provide(gamesDetailKey, { players, scores, holes, gameName, error, load: loadGamesDetailData })

async function reload() { await loadGamesDetailData() }

const displayName = computed(() => shortGameName(gameName.value))

const { sortColumn, sortDirection, sortedPlayers, totalScore, averageScore } = useSortedPlayers(players, scores)

const { viewMode, loadPreference: loadViewPreference } = useViewMode(players, holes)

const viewOptions = computed(() => [
  { value: 'ranking' as const, label: t('Scorecard.ViewRanking'), icon: markRaw(TrophyIcon) },
  { value: 'horizontal' as const, label: t('Scorecard.ViewHorizontal'), icon: markRaw(TableCellsIcon) },
  { value: 'vertical' as const, label: t('Scorecard.ViewVertical'), icon: markRaw(ListBulletIcon) },
])

/** Nächste leere Loch-Position — zeigt bis maximal HOLE_MAX. */
const nextNewHole = computed(() => {
  const max = holes.value.length ? Math.max(...holes.value) : 0
  return Math.min(VALIDATION.HOLE_MAX, max + 1)
})

function sortBy(column: 'name' | 'total' | 'average') {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

watchEffect(async () => {
  if (!hasValidGameId.value) return
  await loadGamesDetailData()
  loadViewPreference()
})
</script>

<style scoped>
.games-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-block: 1.25rem 1.5rem;
}

.games-detail__header {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.games-detail__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.games-detail__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.games-detail__body {
  min-height: 6rem;
}

/* Hole-Pill-Leiste: direkter Zugriff auf Löcher von allen drei Scorecard-Views */
.games-detail__holes {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  padding-block: 0.15rem 0.35rem;
  scroll-snap-type: x mandatory;
}

.games-detail__hole-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding-inline: 0.75rem;
  border-radius: 999px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--text-default);
  text-decoration: none;
  font-weight: 600;
  font-size: var(--text-sm);
  scroll-snap-align: start;
  flex-shrink: 0;
  transition: transform 120ms var(--ease-spring), background 150ms, color 150ms, border-color 150ms;
}

.games-detail__hole-chip:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.games-detail__hole-chip:active { transform: scale(0.94); }

.games-detail__hole-chip--add {
  color: var(--text-muted);
  background: color-mix(in oklab, var(--text-default) 6%, transparent);
  border-style: dashed;
}
</style>
