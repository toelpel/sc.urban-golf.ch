<template>
  <DefaultLayout>
    <template v-if="!hasValidGameId">
      <GamesListCompact />
    </template>
    <template v-else>
      <GamesHoleView v-if="isHoleView" />
      <template v-else>
        <div class="shrink-0 flex justify-between items-center">
          <h1 class="maintitle mb-4 truncate max-w-[70vw]" :title="gameName">
            {{ displayName }}
          </h1>
          <button @click="toggleView" :title="viewModeLabel" class="flex items-center justify-center w-8 h-8 -mt-2 rounded-md bg-gray-200 text-sm text-gray-800 shadow hover:bg-gray-300
         dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition">
            <TableCellsIcon v-if="viewMode === 'horizontal'" class="w-5 h-5" />
            <ListBulletIcon v-else-if="viewMode === 'vertical'" class="w-5 h-5" />
            <TrophyIcon v-else class="w-5 h-5" />
          </button>
        </div>

        <div v-if="players.length === 0" class="shrink-0 text-gray-500 text-center dark:text-gray-300">
          {{ $t('Scorecard.Loading') }}
        </div>

        <div v-else>
          <GamesDetailHorizontal v-if="viewMode === 'horizontal'" :players="sortedPlayers" :holes="holes"
            :scores="scores" :game-id="gameId" :sort-column="sortColumn" :sort-direction="sortDirection"
            :sorted-players="sortedPlayers" :average-score="averageScore" :total-score="totalScore" @sort="sortBy" />
          <GamesDetailVertical v-else-if="viewMode === 'vertical'" :players="sortedPlayers" :holes="holes"
            :scores="scores" :game-id="gameId" :sort-column="sortColumn" :sort-direction="sortDirection"
            :sorted-players="sortedPlayers" :average-score="averageScore" :total-score="totalScore" @sort="sortBy" />
          <GamesDetailRanking v-else :sort-column="sortColumn" :sort-direction="sortDirection"
            :sorted-players="sortedPlayers" :average-score="averageScore" :total-score="totalScore" @sort="sortBy" />
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
import GamesHoleView from '@/components/games/GamesHoleView.vue'

import { ArrowPathIcon, TrophyIcon, TableCellsIcon, ListBulletIcon } from '@heroicons/vue/24/solid'
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

const viewModeLabel = computed(() => {
  const labels: Record<string, string> = {
    horizontal: t('Scorecard.ViewHorizontal'),
    vertical: t('Scorecard.ViewVertical'),
    ranking: t('Scorecard.ViewRanking')
  }
  return labels[viewMode.value] ?? ''
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
