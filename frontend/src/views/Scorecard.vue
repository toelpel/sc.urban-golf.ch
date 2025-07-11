<template>
  <DefaultTemplate>
    <!-- HEADER -->
    <div class="shrink-0 flex justify-between items-center">
      <h1 class="maintitle">Scorecard – {{ gameName }}</h1>
      <button @click="toggleView" class="flex items-center justify-center w-8 h-8 -mt-2 rounded-md bg-gray-200 text-sm text-gray-800 shadow hover:bg-gray-300
         dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition" title="Ansicht wechseln">
        <ArrowPathIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- LOADING -->
    <div v-if="players.length === 0" class="shrink-0 text-gray-500 text-center dark:text-gray-300">
      {{ $t('ScorecardLoading') }}
    </div>

    <!-- MAIN -->
    <div v-else>
      <component :is="viewMode === 'horizontal' ? ScorecardHorizontal : ScorecardVertical" :players="sortedPlayers"
        :holes="holes" :scores="scores" :game-id="gameId" :sort-column="sortColumn" :sort-direction="sortDirection"
        :sorted-players="sortedPlayers" :average-score="averageScore" :total-score="totalScore" @sort="sortBy" />
    </div>
    <div class="mt-4">
      <button @click="goBack" class="button-primary w-full text-center">{{ $t('Back') }}</button>
    </div>
  </DefaultTemplate>
</template>

<script setup>
import DefaultTemplate from '@/layouts/DefaultTemplate.vue'
import ScorecardHorizontal from '../components/Scorecard_Horizontal.vue';
import ScorecardVertical from '../components/Scorecard_Vertical.vue';
import { onMounted, ref, computed, watch, nextTick } from 'vue';
import { ArrowPathIcon } from '@heroicons/vue/24/solid';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter()
const gameId = route.params.id;

const players = ref([]);
const scores = ref({});
const holes = ref([]);
const gameName = ref('');

const sortColumn = ref('name');
const sortDirection = ref('asc');
const viewMode = ref('horizontal'); // default, wird überschrieben

function goBack() {
  router.back()
}

function sortBy(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
}

const sortedPlayers = computed(() => {
  return [...players.value].sort((a, b) => {
    let aValue, bValue;

    if (sortColumn.value === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else if (sortColumn.value === 'total') {
      aValue = totalScore(a.id);
      bValue = totalScore(b.id);
    } else if (sortColumn.value === 'average') {
      aValue = averageScore(a.id);
      bValue = averageScore(b.id);
    }

    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1;
    return 0;
  });
});

function totalScore(playerId) {
  const playerScores = scores.value[playerId] || {};
  return Object.values(playerScores)
    .map(n => parseInt(n) || 0)
    .reduce((sum, val) => sum + val, 0);
}

function averageScore(playerId) {
  const playerScores = scores.value[playerId] || {};
  const numeric = Object.values(playerScores)
    .map(n => parseInt(n))
    .filter(n => !isNaN(n));
  if (numeric.length === 0) return '–';
  const avg = numeric.reduce((sum, val) => sum + val, 0) / numeric.length;
  return avg.toFixed(1);
}

function toggleView() {
  viewMode.value = viewMode.value === 'horizontal' ? 'vertical' : 'horizontal';
}

watch(viewMode, (val) => {
  localStorage.setItem('scorecardView', val);
});

onMounted(async () => {
  try {
    const { data: gameList } = await axios.get('/games');
    const match = gameList.find(g => g.id === parseInt(gameId));
    gameName.value = match?.name || `Spiel #${gameId}`;

    const { data: playerList } = await axios.get(`/games/${gameId}/players`);
    players.value = playerList;

    for (const player of players.value) {
      scores.value[player.id] = {};
    }

    const { data: scoreData } = await axios.get('/scores', {
      params: { game_id: gameId }
    });

    for (const entry of scoreData) {
      const { player_id, hole, strokes } = entry;
      if (!scores.value[player_id]) scores.value[player_id] = {};
      scores.value[player_id][hole] = strokes;
    }

    holes.value = Array.from(
      new Set(scoreData.map(entry => entry.hole))
    ).sort((a, b) => a - b);

    if (holes.value.length === 0) {
      holes.value.push(1);
    }

    // Entscheidung über Ansicht treffen, nachdem alle Daten geladen sind
    await nextTick();
    const saved = localStorage.getItem('scorecardView');
    if (saved === 'horizontal' || saved === 'vertical') {
      viewMode.value = saved;
    } else {
      viewMode.value = (players.value.length > 4 && holes.value.length > 4) ? 'vertical' : 'horizontal';
    }
  } catch (err) {
    console.error('Fehler beim Laden der Scorecard:', err);
    alert('Fehler beim Laden der Scorecard-Daten.');
  }
});
</script>