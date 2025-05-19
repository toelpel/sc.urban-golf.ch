<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Scorecard – Spiel #{{ gameId }}</h1>

    <div v-if="players.length && scores" class="overflow-x-auto">
      <table class="min-w-full border">
        <thead>
          <tr>
            <th class="border px-2 py-1">Spieler</th>
            <th v-for="n in holes" :key="n" class="border px-2 py-1">Loch {{ n }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in players" :key="player.id">
            <td class="border px-2 py-1 font-medium">{{ player.name }}</td>
            <td v-for="hole in holes" :key="hole" class="border px-2 py-1">
              <input
                v-model.number="scores[player.id][hole]"
                type="number"
                min="1"
                max="20"
                class="w-16 p-1 border rounded text-center"
                @blur="submitScore(player.id, hole)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p class="text-gray-600">Lade Spieler und Scores ...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const gameId = route.params.id;
const holes = Array.from({ length: 9 }, (_, i) => i + 1); // 9 Löcher

const players = ref([]);
const scores = reactive({});

onMounted(async () => {
  const res = await fetch(`https://api.sc.urban-golf.ch/api/games/${gameId}/players`);
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.error('Unerwartete Spielerantwort:', data);
    return;
  }
  players.value = data;

  for (const player of players.value) {
    scores[player.id] = {};
    holes.forEach(h => (scores[player.id][h] = ''));
  }

  const scoreRes = await fetch(`https://api.sc.urban-golf.ch/api/scores?game_id=${gameId}`);
  const scoreData = await scoreRes.json();

  for (const entry of scoreData) {
    const { player_id, hole, strokes } = entry;
    if (!scores[player_id]) scores[player_id] = {};
    scores[player_id][hole] = strokes;
  }
});

async function submitScore(playerId, hole) {
  const strokes = scores[playerId][hole];
  if (!strokes || strokes < 1) return;

  await fetch('https://api.sc.urban-golf.ch/api/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      game_id: gameId,
      player_id: playerId,
      hole,
      strokes
    })
  });
}
</script>

<style scoped>
</style>