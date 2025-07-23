<template>
  <DefaultTemplate>
    <template v-if="!hasValidGameId">
      <GamesListCompact />
    </template>
    <template v-else>
      <GamesHoleView v-if="isHoleView" />
      <template v-else>
        <!-- Scorecard Ansicht -->
        <div class="shrink-0 flex justify-between items-center">
          <h1 class="maintitle truncate max-w-[60vw]" :title="gameName">
            {{ $t('Scorecard.Title') }} – {{ shortGameName }}
          </h1>
          <button @click="toggleView" class="flex items-center justify-center w-8 h-8 -mt-2 rounded-md bg-gray-200 text-sm text-gray-800 shadow hover:bg-gray-300
         dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition">
            <ArrowPathIcon class="w-5 h-5" />
          </button>
        </div>

        <div v-if="players.length === 0" class="shrink-0 text-gray-500 text-center dark:text-gray-300">
          {{ $t('Scorecard.Loading') }}
        </div>

        <div v-else>
          <GamesDetailHorizontal v-if="viewMode === 'horizontal'" :players="sortedPlayers" :holes="holes"
            :scores="scores" :game-id="gameId" :sort-column="sortColumn" :sort-direction="sortDirection"
            :sorted-players="sortedPlayers" :average-score="averageScore" :total-score="totalScore" @sort="sortBy" />
          <GamesDetailVertical v-else :players="sortedPlayers" :holes="holes" :scores="scores" :game-id="gameId"
            :sort-column="sortColumn" :sort-direction="sortDirection" :sorted-players="sortedPlayers"
            :average-score="averageScore" :total-score="totalScore" @sort="sortBy" />
        </div>
      </template>
    </template>
  </DefaultTemplate>
</template>

<script setup>
import DefaultTemplate from '@/layouts/DefaultTemplate.vue';
import GamesListCompact from '@/components/GamesListCompact.vue';
import GamesDetailHorizontal from '@/components/GamesDetail_Horizontal.vue';
import GamesDetailVertical from '@/components/GamesDetail_Vertical.vue';
import GamesHoleView from '@/components/GamesHoleView.vue';

import { ArrowPathIcon } from '@heroicons/vue/24/solid';
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import { useGamesDetailData } from '@/composables/useGamesDetailData.js';
import { useSortedPlayers } from '@/composables/useSortedPlayers.js';
import { useViewMode } from '@/composables/useViewMode.js';

// Route & Validierung
const route = useRoute();
const gameId = computed(() => route.params.gameId);
const hasValidGameId = computed(() =>
  typeof gameId.value === 'string' && /^[a-zA-Z0-9_-]{10,30}$/.test(gameId.value)
);
const isHoleView = computed(() => 'holeId' in route.params);

// Daten laden
const {
  players,
  scores,
  holes,
  gameName,
  load: loadGamesDetailData
} = useGamesDetailData(gameId);

// Shorten gamename
const shortGameName = computed(() => {
  return gameName.value.length > 60
    ? gameName.value.slice(0, 57) + '…'
    : gameName.value;
});

// Sortierlogik
const {
  sortColumn,
  sortDirection,
  sortedPlayers,
  totalScore,
  averageScore
} = useSortedPlayers(players, scores);

// Ansicht wechseln
const {
  viewMode,
  toggleView,
  loadPreference: loadViewPreference
} = useViewMode(players, holes);

function sortBy(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
}

// Trigger: Daten laden bei gültiger gameId
watchEffect(async () => {
  if (!hasValidGameId.value) return;
  await loadGamesDetailData();
  loadViewPreference();
});
</script>