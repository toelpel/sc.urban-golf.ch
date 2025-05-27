<template>
  <div class="max-w-6xl mx-auto px-4">
    <h1 class="text-2xl font-bold mb-6 text-center">
      Scorecard – Spiel #{{ gameId }}
    </h1>

    <div v-if="players.length === 0" class="text-gray-500 text-center">
      Lade Spieler und Scores ...
    </div>

    <div v-else>
      <table class="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th class="border-b p-2 text-left">Spieler</th>
            <th
              v-for="hole in holes"
              :key="hole"
              class="border-b p-2 text-center"
            >
              Loch {{ hole }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="player in players"
            :key="player.id"
            class="odd:bg-white even:bg-gray-50"
          >
            <td class="p-2 font-medium text-left">{{ player.name }}</td>
            <td
              v-for="hole in holes"
              :key="hole"
              class="p-2 text-center"
            >
              <input
                type="number"
                v-model="scores[player.id][hole]"
                @blur="saveScore(player.id, hole)"
                class="w-16 p-1 text-center border border-gray-300 rounded"
                min="1"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <button
        @click="addHole"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
      >
        + Loch hinzufügen
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const gameId = route.params.id;
const holes = ref([1]); // beginne mit einem Loch

const players = ref([]);
const scores = reactive({});

function addHole() {
  const next = Math.max(...holes.value) + 1;
  holes.value.push(next);
  for (const player of players.value) {
    scores[player.id][next] = '';
  }
}

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
    holes.value.forEach(h => (scores[player.id][h] = ''));
  }

  const scoreRes = await fetch(`https://api.sc.urban-golf.ch/api/scores?game_id=${gameId}`);
  const scoreData = await scoreRes.json();

  for (const entry of scoreData) {
    const { player_id, hole, strokes } = entry;
    if (!scores[player_id]) scores[player_id] = {};
    scores[player_id][hole] = strokes;
    if (!holes.value.includes(hole)) holes.value.push(hole);
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