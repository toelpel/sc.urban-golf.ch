<template>
  <div class="max-w-xl mx-auto px-4 text-center">
    <h1 class="text-2xl font-bold mb-1">Urban-Golf.ch – ScoreCard</h1>
    <p class="text-sm text-gray-600 mb-6">{{ gameName }} – Hole {{ hole }} – edit</p>

    <div v-for="player in players" :key="player.id" class="mb-6 border-t pt-4">
      <div class="text-lg font-semibold mb-2">{{ player.name }}</div>
      <div class="flex items-center justify-center space-x-4">
        <button
          @click="changeStrokes(player.id, -1)"
          class="w-10 h-10 text-xl border rounded-lg bg-white hover:bg-gray-100"
        >–</button>

        <select
          v-model="scores[player.id]"
          @change="saveScore(player.id)"
          class="text-xl font-bold text-center bg-gray-100 rounded-lg p-2 border"
        >
          <option v-for="n in 15" :key="n" :value="n">{{ n }}</option>
        </select>

        <button
          @click="changeStrokes(player.id, 1)"
          class="w-10 h-10 text-xl border rounded-lg bg-white hover:bg-gray-100"
        >+</button>
      </div>
    </div>

    <div class="space-y-4 mt-6">
      <router-link
        :to="`/hole/${gameId}/${parseInt(hole) - 1}`"
        v-if="hole > 1"
        class="block w-full bg-gray-200 py-3 rounded-xl font-semibold"
      >
        Zurück
      </router-link>

      <router-link
        :to="`/hole/${gameId}/${parseInt(hole) + 1}`"
        class="block w-full bg-gray-200 py-3 rounded-xl font-semibold"
      >
        Weiter
      </router-link>

      <router-link
        :to="`/scorecard/${gameId}`"
        class="block w-full bg-gray-100 py-3 rounded-xl font-semibold"
      >
        Scorecard
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const gameId = route.params.gameId;
const hole = route.params.hole;

const players = ref([]);
const scores = ref({});
const gameName = ref('');

async function loadHoleData() {
  scores.value = {};

  // Spielname erneut holen (optional caching möglich)
  const resGame = await fetch(`https://api.sc.urban-golf.ch/api/games`);
  const games = await resGame.json();
  const match = games.find(g => g.id === parseInt(gameId));
  gameName.value = match?.name || `Spiel #${gameId}`;

  // Spieler laden
  const res = await fetch(`https://api.sc.urban-golf.ch/api/games/${gameId}/players`);
  players.value = await res.json();

  for (const player of players.value) {
    scores.value[player.id] = '';
  }

  // Scores für aktuelles Loch laden
  const resScores = await fetch(`https://api.sc.urban-golf.ch/api/scores?game_id=${gameId}`);
  const allScores = await resScores.json();

  for (const entry of allScores) {
    if (parseInt(entry.hole) === parseInt(route.params.hole)) {
      scores.value[entry.player_id] = entry.strokes;
    }
  }
}

onMounted(loadHoleData);

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
      hole: parseInt(hole),
      strokes: scores.value[playerId]
    })
  });
}

import { watch } from 'vue';

watch(() => route.params.hole, async () => {
  await loadHoleData();
});

</script>
