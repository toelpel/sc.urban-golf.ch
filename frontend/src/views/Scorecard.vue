<template>
  <div>
    <h1 class="text-2xl font-bold mb-4 text-center">Scorecard – {{ gameName }}</h1>

    <div v-if="players.length === 0" class="text-gray-500 text-center dark:text-gray-300">
      {{ $t('ScorecardLoading') }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="scorecard-table">
        <thead class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
          <tr>
            <th class="scorecard-header-cell sticky left-0 cursor-pointer z-10" @click="sortBy('name')">
              {{ $t('Player') }}
              <span v-if="sortColumn === 'name'">{{ sortDirectionSymbol }}</span>
            </th>
            <th v-for="hole in holes" :key="hole" class="scorecard-header-cell">
              <router-link :to="`/hole/${gameId}/${hole}`" class="hover:underline text-blue-600 dark:text-blue-400">
                {{ hole }}
              </router-link>
            </th>
            <th class="scorecard-header-cell sticky right-12 z-10 cursor-pointer" @click="sortBy('average')">
              Ø <span v-if="sortColumn === 'average'">{{ sortDirectionSymbol }}</span>
            </th>
            <th class="scorecard-header-cell sticky right-0 z-10 cursor-pointer" @click="sortBy('total')">
              {{ $t('Total') }} <span v-if="sortColumn === 'total'">{{ sortDirectionSymbol }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in sortedPlayers" :key="player.id" class="scorecard-hover-row">
            <td class="scorecard-player-cell sticky left-0">
              {{ player.name }}
            </td>
            <td v-for="hole in holes" :key="hole" class="scorecard-cell">
              {{ scores[player.id]?.[hole] ?? '–' }}
            </td>
            <td class="scorecard-metric-cell sticky right-12">
              {{ averageScore(player.id) }}
            </td>
            <td class="scorecard-metric-cell sticky right-0">
              {{ totalScore(player.id) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-6 text-center">
      <button @click="$router.back()" class="button-primary w-full text-center">
        {{ $t('Back') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

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