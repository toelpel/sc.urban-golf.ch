<template>
  <DefaultLayout>
    <template v-if="!hasValidGameId">
      <GamesListCompact />
    </template>
    <template v-else>
      <GamesHoleView v-if="isHoleView" />
      <template v-else>
        <div class="shrink-0 flex flex-col items-center gap-2 mb-2">
          <h1 class="maintitle mb-0 truncate max-w-[70vw]" :title="gameName">
            {{ displayName }}
          </h1>
          <div class="inline-flex rounded-lg p-0.5 bg-white/30 dark:bg-gray-800/40 backdrop-blur-sm border border-white/30 dark:border-white/10 shadow-sm">
            <button v-for="mode in viewModes" :key="mode.key" @click="viewMode = mode.key"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
              :class="viewMode === mode.key
                ? 'bg-blue-500 text-white shadow-md dark:bg-blue-400 dark:text-gray-900'
                : 'text-gray-600 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-gray-700/40'">
              <component :is="mode.icon" class="w-3.5 h-3.5" />
              <span class="hidden sm:inline">{{ mode.label }}</span>
            </button>
          </div>
        </div>

        <GamesDetailSkeleton v-if="players.length === 0" :rows="4" :columns="6" />

        <div v-else>
          <Transition name="view-fade" mode="out-in">
            <GamesDetailHorizontal v-if="viewMode === 'horizontal'" key="horizontal" :players="sortedPlayers"
              :holes="holes" :scores="scores" :game-id="gameId" :sort-column="sortColumn"
              :sort-direction="sortDirection" :sorted-players="sortedPlayers" :average-score="averageScore"
              :total-score="totalScore" @sort="sortBy" />
            <GamesDetailVertical v-else-if="viewMode === 'vertical'" key="vertical" :players="sortedPlayers"
              :holes="holes" :scores="scores" :game-id="gameId" :sort-column="sortColumn"
              :sort-direction="sortDirection" :sorted-players="sortedPlayers" :average-score="averageScore"
              :total-score="totalScore" @sort="sortBy" />
            <GamesDetailRanking v-else key="ranking" :sort-column="sortColumn" :sort-direction="sortDirection"
              :sorted-players="sortedPlayers" :average-score="averageScore" :total-score="totalScore"
              @sort="sortBy" />
          </Transition>
        </div>
      </template>
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

import { TrophyIcon, TableCellsIcon, ListBulletIcon } from '@heroicons/vue/24/solid'
import { computed, provide, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useGamesDetailData } from '@/composables/useGamesDetailData'
import { useSortedPlayers } from '@/composables/useSortedPlayers'
import { useViewMode } from '@/composables/useViewMode'
import { gamesDetailKey } from '@/types'
import { shortGameName } from '@/utils/format'

const route = useRoute()
const { t } = useI18n()
const gameId = computed(() => route.params.gameId as string)
const hasValidGameId = computed(() =>
  typeof gameId.value === 'string' && /^[a-zA-Z0-9_-]{10,30}$/.test(gameId.value)
)
const isHoleView = computed(() => 'holeId' in route.params)

const {
  players,
  scores,
  holes,
  gameName,
  load: loadGamesDetailData
} = useGamesDetailData(gameId)

provide(gamesDetailKey, { players, scores, holes, gameName, load: loadGamesDetailData })

const displayName = computed(() => shortGameName(gameName.value))

const {
  sortColumn,
  sortDirection,
  sortedPlayers,
  totalScore,
  averageScore
} = useSortedPlayers(players, scores)

const {
  viewMode,
  toggleView,
  loadPreference: loadViewPreference
} = useViewMode(players, holes)

const viewModes = computed(() => [
  { key: 'horizontal' as const, label: t('Scorecard.ViewHorizontal'), icon: TableCellsIcon },
  { key: 'vertical' as const, label: t('Scorecard.ViewVertical'), icon: ListBulletIcon },
  { key: 'ranking' as const, label: t('Scorecard.ViewRanking'), icon: TrophyIcon },
])

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
