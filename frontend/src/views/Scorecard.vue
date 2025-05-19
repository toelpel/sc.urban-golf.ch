<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Scorecard – Spiel #{{ gameId }}</h1>

    <div v-if="players.length && scores.length" class="overflow-x-auto">
      <table class="min-w-full border">
        <thead>
          <tr>
            <th class="border px-2 py-1">Spieler</th>
            <th v-for="n in holes" :key="n" class="border px-2 py-1">Loch {{ n }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in players" :key="player">
            <td class="border px-2 py-1 font-medium">{{ getPlayerName(player) }}</td>
            <td v-for="hole in holes" :key="hole" class="border px-2 py-1">
              <input
                v-model.number="scores[player][hole]"
                type="number"
                min="1"
                max="20"
                class="w-16 p-1 border rounded text-center"
                @blur="submitScore(player, hole)"
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
const playerNames = reactive({});

onMounted(async () => {
  const ids = JSON.parse(localStorage.getItem(`game-${gameId}-players`)) || [];
  players.value = ids;

  for (const id of ids) {
    const res = await fetch(`https://api.sc.urban-golf.ch/api/players`);
    const allPlayers = await res.json();
    const player = allPlayers.find(p => p.id === id);
    playerNames[id] = player?.name || `#${id}`;
    scores[id] = {};
    holes.forEach(h => scores[id][h] = '');
  }
});

function getPlayerName(id) {
  return playerNames[id] || `#${id}`;
}

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