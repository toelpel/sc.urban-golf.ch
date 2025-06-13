<template>
  <div class="text-center">
    <h1 class="text-2xl font-bold mb-1">{{ gameName }} – Hole {{ hole }}</h1>
    <div class="flex flex-wrap justify-center gap-2 my-4 items-center text-sm text-gray-700 dark:text-gray-300">
      <span class="mr-2 font-medium">Loch:</span>
      <router-link
        v-for="n in holes"
        :key="n"
        :to="`/hole/${gameId}/${n}`"
        class="px-3 py-1 rounded border font-semibold 
              bg-gray-200 hover:bg-gray-300 text-gray-800 
              dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
        :class="{ 'ring-2 ring-green-500': n === parseInt(hole) }"
      >
        {{ n }}
      </router-link>
    </div>
    <div v-for="player in players" :key="player.id" class="mb-6 border-t pt-4">
      <div class="text-lg font-semibold mb-2">{{ player.name }}</div>
      <div class="flex items-center justify-center space-x-4">
        <button
          @click="changeStrokes(player.id, -1)"
          class="button-primary"
        >➖</button>

        <select
          v-model="scores[player.id]"
          @change="saveScore(player.id)"
          class="select-field"
        >
          <option v-for="n in range(-3, 11)" :key="n" :value="n">{{ n }}</option>
        </select>

        <button
          @click="changeStrokes(player.id, 1)"
          class="button-primary"
        >➕</button>
      </div>
    </div>

    <div class="flex flex-col items-stretch gap-3 mt-6">
      <router-link
        :to="`/hole/${gameId}/${hole + 1}`"
        class="button-primary w-full text-center"
      >
      ⏩ Weiter
      </router-link>

      <router-link
        :to="`/hole/${gameId}/${hole - 1}`"
        v-if="hole > 1"
        class="button-primary w-full text-center"
      >
      ⏪ Zurück
      </router-link>

      <router-link
        :to="`/scorecard/${gameId}`"
        class="button-primary w-full text-center"
      >
      📋 Scorecard
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

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

  // Spielndaten laden
  const resGame = await fetch(`https://api.sc.urban-golf.ch/api/games`);
  const games = await resGame.json();
  const match = games.find(g => g.id === parseInt(gameId));
  gameName.value = match?.name || `Spiel #${gameId}`;

  // Spieler laden
  const res = await fetch(`https://api.sc.urban-golf.ch/api/games/${gameId}/players`);
  players.value = (await res.json());

  for (const player of players.value) {
    scores.value[player.id] = '';
  }

  // Scores für aktuelles Loch laden
  const resScores = await fetch(`https://api.sc.urban-golf.ch/api/scores?game_id=${gameId}`);
  const allScores = await resScores.json();

  holes.value = Array.from(new Set(allScores.map(entry => entry.hole))).sort((a, b) => a - b);
  // if (holes.value.length === 0) holes.value.push(1);

  for (const entry of allScores) {
    if (parseInt(entry.hole) === hole.value) {
      scores.value[entry.player_id] = entry.strokes;
    }
  }
}

function changeStrokes(playerId, delta) {
  const current = parseInt(scores.value[playerId]) || 0;
  let updated = current + delta;
  if (updated < 1) updated = 1;
  if (updated > 15) updated = 15;
  scores.value[playerId] = updated;
  saveScore(playerId);
}

async function saveScore(playerId) {
  await fetch(`https://api.sc.urban-golf.ch/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      game_id: gameId,
      player_id: playerId,
      hole: hole.value,
      strokes: scores.value[playerId]
    })
  });
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

</script>