<template>
  <div class="max-w-4xl mx-auto px-4">
    <h1 class="text-2xl font-bold mb-6 text-center">Alle Spiele</h1>

    <!-- Suchfeld mit Lösch-Icon -->
    <div class="relative mb-4">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="🔍 Spiel- oder Spielername"
        class="input-field w-full pr-10"
      />
      <button
        v-if="searchTerm"
        @click="searchTerm = ''"
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
      >
        ✕
      </button>
    </div>

    <div v-if="paginatedGames.length === 0" class="text-center text-gray-500">
      Keine Spiele gefunden.
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="game in paginatedGames"
        :key="game.id"
        class="bg-white shadow-sm rounded py-3 px-4 hover:bg-gray-50 dark:bg-gray-800 dark:text-white"
      >
        <div class="flex justify-between items-center">
          <div>
            <div class="font-semibold text-lg">{{ game.name }}</div>
            <div class="text-sm text-gray-500">
              {{ formatDate(game.created_at) }}
              <span v-if="playerMap[game.id]">– {{ playerMap[game.id].join(', ') }}</span>
            </div>
          </div>
          <div class="flex gap-2 items-center">
            <router-link :to="`/scorecard/${game.id}`" class="button-primary">📋</router-link>
            <button @click="toggleDetails(game.id)" class="text-xl">
              {{ expandedGameId === game.id ? '⯆' : '⯈' }}
            </button>
          </div>
        </div>

        <!-- Detailbereich -->
        <div v-if="expandedGameId === game.id" class="mt-3 border-t pt-3 text-sm text-gray-700 dark:text-gray-300">
          <div class="mb-2">🕳️ Gespielte Löcher: {{ gameMeta[game.id]?.holes?.length || 0 }}</div>
          <div>
            <div v-for="player in gameMeta[game.id]?.players || []" :key="player.id" class="mb-1">
              {{ player.name }} – Ø {{ player.avg.toFixed(2) }} – Σ {{ player.total }}
            </div>
          </div>
        </div>
      </li>
    </ul>

    <div v-if="filteredGames.length > perPage" class="flex flex-row gap-3 mt-6">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="button-primary flex-1 text-center"
      >
        ⏪ Zurück
      </button>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="button-primary flex-1 text-center"
      >
        ⏩ Weiter
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const games = ref([]);
const playerMap = ref({});
const gameMeta = ref({});
const searchTerm = ref('');
const expandedGameId = ref(null);
const currentPage = ref(1);
const perPage = 10;

onMounted(async () => {
  const res = await fetch('https://api.sc.urban-golf.ch/api/games');
  const data = await res.json();

  if (!Array.isArray(data)) {
    alert('API-Antwort ist kein Array');
    return;
  }

  games.value = data;

  for (const game of games.value) {
    const resPlayers = await fetch(`https://api.sc.urban-golf.ch/api/games/${game.id}/players`);
    const players = await resPlayers.json();
    playerMap.value[game.id] = players.map(p => p.name);
  }
});

function toggleDetails(gameId) {
  if (expandedGameId.value === gameId) {
    expandedGameId.value = null;
    return;
  }

  expandedGameId.value = gameId;

  if (gameMeta.value[gameId]) return; // already loaded

  loadMeta(gameId);
}

async function loadMeta(gameId) {
  const resScores = await fetch(`https://api.sc.urban-golf.ch/api/scores?game_id=${gameId}`);
  const scores = await resScores.json();

  const holes = [...new Set(scores.map(s => s.hole))];
  const players = {};

  for (const s of scores) {
    if (!players[s.player_id]) {
      players[s.player_id] = { id: s.player_id, name: s.player_name, total: 0, count: 0 };
    }
    players[s.player_id].total += s.strokes;
    players[s.player_id].count += 1;
  }

  gameMeta.value[gameId] = {
    holes,
    players: Object.values(players).map(p => ({
      ...p,
      avg: p.count ? p.total / p.count : 0
    }))
  };
}

const filteredGames = computed(() => {
  if (searchTerm.value.length < 3) return games.value;

  return games.value.filter(game => {
    const name = game.name.toLowerCase();
    const players = (playerMap.value[game.id] || []).join(' ').toLowerCase();
    const term = searchTerm.value.toLowerCase();
    return name.includes(term) || players.includes(term);
  });
});

const totalPages = computed(() => Math.ceil(filteredGames.value.length / perPage));

const paginatedGames = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredGames.value.slice(start, start + perPage);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString('de-CH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
</script>
