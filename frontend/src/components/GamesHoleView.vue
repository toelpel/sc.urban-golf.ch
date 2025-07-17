<template>
  <h1 class="maintitle">
    {{ gameName }} – {{ $t('General.Hole') }} {{ hole }} –
    <router-link :to="{ name: 'GamesNew', query: { gameId: gameId } }" class="text-blue-500">✏️</router-link>
  </h1>

  <div class="flex flex-wrap justify-center gap-2 my-4 items-center text-sm text-gray-700 dark:text-gray-300">
    <router-link v-for="n in holes" :key="n" :to="`/games/${gameId}/${n}`" class="px-3 py-1 rounded border font-semibold 
             bg-gray-200 hover:bg-gray-300 text-gray-800 
             dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white" :class="{ 'ring-2 ring-green-500': n === hole }">
      {{ n }}
    </router-link>
  </div>

  <div v-for="player in players" :key="player.id" class="mb-2 border-t pt-2">
    <div class="flex items-center space-x-4">
      <div
        class="w-64 truncate self-center text-left text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight pr-2"
        :title="player.name">
        {{ player.name }}
      </div>

      <button @click="changeStrokes(player.id, -1)" class="button-primary w-10 h-10 flex items-center justify-center"
        aria-label="Weniger Schläge">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 -translate-y-[1px] -translate-x-[10px]" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="4">
          <path d="M5 12h14" />
        </svg>
      </button>

      <select v-model="scores[player.id][hole]" @change="saveScore(player.id)" class="select-field w-12 text-center">
        <option v-for="n in range(-3, 15)" :key="n" :value="n">{{ n }}</option>
      </select>

      <button @click="changeStrokes(player.id, 1)" class="button-primary w-10 h-10 flex items-center justify-center"
        aria-label="Mehr Schläge">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 -translate-y-[1px] -translate-x-[10px]" fill="none"
          viewBox="0 0 24 24" stroke="currentColor" stroke-width="4">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  </div>

  <div class="flex flex-col items-stretch gap-3 mt-6">
    <div class="flex flex-row gap-3">
      <router-link v-if="hole > 1" :to="`/games/${gameId}/${hole - 1}`" class="button-primary flex-1 text-center">
        {{ $t('General.Back') }}
      </router-link>

      <router-link :to="`/games/${gameId}/${hole + 1}`" class="button-primary flex-1 text-center">
        {{ $t('General.Forward') }}
      </router-link>
    </div>

    <router-link :to="`/games/${gameId}`" class="button-primary w-full text-center">
      {{ $t('General.Scorecard') }}
    </router-link>
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, computed, onMounted, watch } from 'vue';
=======
import { ref, onMounted, computed, watch } from 'vue';
>>>>>>> ec7b2fe20186f8fd9821f6031dcc38617681e4d5
import { useRoute } from 'vue-router';
import { useGamesDetailData } from '@/composables/useGamesDetailData.js';
import axios from 'axios';
import { useGamesDetailData } from '@/composables/useGamesDetailData';

const route = useRoute();
<<<<<<< HEAD
const gameId = ref(route.params.gameId);
const hole = computed(() => parseInt(route.params.holeId));

const { players, scores, holes, gameName, load } = useGamesDetailData(gameId);

async function ensureScoreFieldsExist() {
  for (const player of players.value) {
    if (!scores.value[player.id]) scores.value[player.id] = {};
    if (scores.value[player.id][hole.value] === undefined) {
      scores.value[player.id][hole.value] = '';
=======
const gameId = route.params.gameId;
const hole = computed(() => parseInt(route.params.holeId));

const { players, scores, holes, gameName, load } = useGamesDetailData(ref(gameId));

watch(() => hole.value, async () => {
  await load(); // optional: holewechsel → reload scores
});

onMounted(async () => {
  await load();
  loadHoleScores(); // Initialscores für aktuelles Loch setzen
});

function loadHoleScores() {
  // Scores initialisieren mit "" oder 0
  for (const player of players.value) {
    scores.value[player.id] ??= '';
  }

  axios.get('/scores', { params: { game_id: gameId } }).then(({ data }) => {
    holes.value.splice(0, holes.value.length, ...Array.from(new Set(data.map(e => e.hole))).sort((a, b) => a - b));

    for (const entry of data) {
      if (parseInt(entry.hole) === hole.value) {
        scores.value[entry.player_id] = entry.strokes;
      }
>>>>>>> ec7b2fe20186f8fd9821f6031dcc38617681e4d5
    }
  });
}

onMounted(async () => {
  await load();
  ensureScoreFieldsExist();
});

watch(() => hole.value, () => {
  ensureScoreFieldsExist();
});

function changeStrokes(playerId, delta) {
  const current = scores.value[playerId][hole.value] || 0;
  let updated = current + delta;
  if (updated < -3) updated = -3;
  if (updated > 15) updated = 15;
  scores.value[playerId][hole.value] = updated;
  saveScore(playerId);
}

async function saveScore(playerId) {
  await axios.post('/scores', {
    game_id: gameId.value,
    player_id: playerId,
    hole: hole.value,
    strokes: scores.value[playerId][hole.value]
  });
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
</script>