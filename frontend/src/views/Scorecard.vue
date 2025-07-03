<template>
  <div class="flex flex-col max-w-6xl mx-auto">
    <!-- HEADER -->
    <div class="shrink-0">
      <h1 class="text-2xl font-bold mb-4 text-center">Scorecard – {{ gameName }}</h1>
    </div>

    <!-- LOADING -->
    <div v-if="players.length === 0" class="shrink-0 text-gray-500 text-center dark:text-gray-300">
      {{ $t('ScorecardLoading') }}
    </div>

    <!-- MAIN (scrollable Tabelle) -->
    <div v-else>
      <ScorecardVertical :players="sortedPlayers" :holes="holes" :scores="scores" :game-id="gameId"
        :sort-column="sortColumn" :sort-direction="sortDirection" :sorted-players="sortedPlayers"
        :average-score="averageScore" :total-score="totalScore" @sort="sortBy" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import ScorecardVertical from '../components/Scorecard_Vertical.vue';

const route = useRoute();
const gameId = route.params.id;

const players = ref([]);
const scores = ref({});
const holes = ref([]);
const gameName = ref('');

const sortColumn = ref('name');
const sortDirection = ref('asc');

function sortBy(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = 'asc';
  }
}

const sortDirectionSymbol = computed(() =>
  sortDirection.value === 'asc' ? '↑' : '↓'
);

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
  } catch (err) {
    console.error('Fehler beim Laden der Scorecard:', err);
    alert('Fehler beim Laden der Scorecard-Daten.');
  }
});
</script>