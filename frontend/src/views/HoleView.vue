<template>
  <div>
    <h1 class="maintitle">
      {{ gameName }} – {{ $t('Hole') }} {{ hole }} –
      <router-link :to="{ name: 'NewGame', query: { gameId: gameId } }" class="text-blue-500">✏️</router-link>
    </h1>
    <div class="flex flex-wrap justify-center gap-2 my-4 items-center text-sm text-gray-700 dark:text-gray-300">
      <router-link v-for="n in holes" :key="n" :to="`/hole/${gameId}/${n}`" class="px-3 py-1 rounded border font-semibold 
              bg-gray-200 hover:bg-gray-300 text-gray-800 
              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        :class="{ 'ring-2 ring-green-500': n === parseInt(hole) }">
        {{ n }}
      </router-link>
    </div>
    <div v-for="player in players" :key="player.id" class="mb-2 border-t pt-2">
      <div class="flex items-center space-x-4">
        <div
          class="w-48 truncate self-center text-left text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight pr-2"
          :title="player.name">
          {{ player.name }}
        </div>
        <button @click="changeStrokes(player.id, -1)" class="button-primary w-10 h-10 flex items-center justify-center"
          aria-label="Weniger Schläge">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 -translate-y-[1px] -translate-x-[10px]" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="4" stroke-linecap="butt">
            <path d="M5 12h14" />
          </svg>
        </button>

        <select v-model="scores[player.id]" @change="saveScore(player.id)" class="select-field w-16 text-center">
          <option v-for="n in range(-3, 15)" :key="n" :value="n">{{ n }}</option>
        </select>

        <button @click="changeStrokes(player.id, 1)" class="button-primary w-10 h-10 flex items-center justify-center"
          aria-label="Mehr Schläge">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 -translate-y-[1px] -translate-x-[10px]" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="4" stroke-linecap="butt">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
    <div class="flex flex-col items-stretch gap-3 mt-6">
      <div class="flex flex-row gap-3">
        <router-link :to="`/hole/${gameId}/${hole - 1}`" v-if="hole > 1" class="button-primary flex-1 text-center">
          {{ $t('Back') }}
        </router-link>

        <router-link :to="`/hole/${gameId}/${hole + 1}`" class="button-primary flex-1 text-center">
          {{ $t('Forward') }}
        </router-link>
      </div>

      <router-link :to="`/scorecard/${gameId}`" class="button-primary w-full text-center">
        {{ $t('Scorecard') }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const gameId = route.params.gameId;
const gameName = ref('');
const hole = computed(() => parseInt(route.params.hole));

const players = ref([]);
const scores = ref({});
const holes = ref([]);

watch(() => hole.value, async () => {
  await loadHoleData();
});

onMounted(loadHoleData);

async function loadHoleData() {
  scores.value = {};

  // Spieldaten laden
  const { data: games } = await axios.get('/games');
  const match = games.find(g => g.id === parseInt(gameId));
  gameName.value = match?.name || `Spiel #${gameId}`;

  // Spieler laden
  const { data: playerList } = await axios.get(`/games/${gameId}/players`);
  players.value = playerList;

  for (const player of players.value) {
    scores.value[player.id] = '';
  }

  // Scores für aktuelles Loch laden
  const { data: allScores } = await axios.get(`/scores`, {
    params: { game_id: gameId }
  });

  holes.value = Array.from(new Set(allScores.map(entry => entry.hole))).sort((a, b) => a - b);

  for (const entry of allScores) {
    if (parseInt(entry.hole) === hole.value) {
      scores.value[entry.player_id] = entry.strokes;
    }
  }
}

function changeStrokes(playerId, delta) {
  const current = parseInt(scores.value[playerId]) || 0;
  let updated = current + delta;
  if (updated < -3) updated = -3;
  if (updated > 15) updated = 15;
  scores.value[playerId] = updated;
  saveScore(playerId);
}

async function saveScore(playerId) {
  await axios.post('/scores', {
    game_id: gameId,
    player_id: playerId,
    hole: hole.value,
    strokes: scores.value[playerId]
  });
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
</script>