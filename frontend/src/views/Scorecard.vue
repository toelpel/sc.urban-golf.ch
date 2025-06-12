<template>
  <div class="max-w-full overflow-x-auto">
    <h1 class="text-2xl font-bold mb-6 text-center">
      {{ gameId }} – {{ gameName }}
    </h1>

    <div v-if="players.length === 0" class="text-gray-500 text-center">
      Lade Spieler und Scores ...
    </div>

    <div v-else class="overflow-x-auto">
      <div class="inline-block min-w-full">
        <div class="flex w-full">
          <!-- Fixierte Spieler-Spalte -->
          <table class="table-fixed border-r bg-white">
            <thead>
              <tr>
                <th
                  class="w-40 p-2 text-left cursor-pointer border-b"
                  @click="sortBy('name')"
                >
                  Spieler
                  <span v-if="sortColumn === 'name'">{{ sortDirectionSymbol }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="player in sortedPlayers"
                :key="player.id"
                class="odd:bg-white even:bg-gray-50"
              >
                <td class="p-2 font-medium text-left border-b">{{ player.name }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Scrollbarer Loch-Bereich -->
          <div class="overflow-x-auto">
            <table class="table-fixed">
              <thead>
                <tr>
                  <th
                    v-for="hole in holes"
                    :key="hole"
                    class="w-24 p-2 text-center border-b"
                  >
                    <router-link
                      :to="`/hole/${gameId}/${hole}`"
                      class="text-blue-600 hover:underline"
                    >
                      Loch {{ hole }}
                    </router-link>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="player in sortedPlayers"
                  :key="player.id"
                  class="odd:bg-white even:bg-gray-50"
                >
                  <td
                    v-for="hole in holes"
                    :key="hole"
                    class="p-2 text-center border-b"
                  >
                    {{ scores[player.id]?.[hole] ?? '–' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Fixierte Ø und Total-Spalten -->
          <table class="table-fixed border-l bg-white">
            <thead>
              <tr>
                <th
                  class="w-16 p-2 text-center cursor-pointer border-b"
                  @click="sortBy('average')"
                >
                  Ø
                  <span v-if="sortColumn === 'average'">{{ sortDirectionSymbol }}</span>
                </th>
                <th
                  class="w-20 p-2 text-center cursor-pointer border-b"
                  @click="sortBy('total')"
                >
                  Total
                  <span v-if="sortColumn === 'total'">{{ sortDirectionSymbol }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="player in sortedPlayers"
                :key="player.id"
                class="odd:bg-white even:bg-gray-50"
              >
                <td class="p-2 text-center border-b text-sm">
                  {{ averageScore(player.id) }}
                </td>
                <td class="p-2 text-center border-b font-semibold">
                  {{ totalScore(player.id) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';

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
  // Spielname laden
  const gameRes = await fetch(`https://api.sc.urban-golf.ch/api/games`);
  const gameList = await gameRes.json();
  const match = gameList.find(g => g.id === parseInt(gameId));
  gameName.value = match?.name || `Spiel #${gameId}`;

  // Spieler laden
  const res = await fetch(`https://api.sc.urban-golf.ch/api/games/${gameId}/players`);
  players.value = await res.json();

  for (const player of players.value) {
    scores.value[player.id] = {};
  }

  const scoreRes = await fetch(`https://api.sc.urban-golf.ch/api/scores?game_id=${gameId}`);
  const scoreData = await scoreRes.json();

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
});
</script>