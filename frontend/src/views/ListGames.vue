<template>
  <div>
    <h1 class="maintitle">
      {{ $t('ListGames-AllGames') }}
    </h1>

    <!-- Suchfeld mit Lösch-Icon -->
    <div class="relative mb-4">
      <input type="text" v-model="searchTerm" :placeholder="`🔍 ${$t('ListGames-SearchText')}`"
        class="input-field w-full pr-10" />
      <button v-if="searchTerm" @click="searchTerm = ''"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
        ✕
      </button>
    </div>

    <div v-if="paginatedGames.length === 0" class="text-center text-gray-500 dark:text-gray-400">
      {{ $t('ListGames-NoGamesFound') }}
    </div>

    <ul v-else class="space-y-2">
      <li v-for="game in paginatedGames" :key="game.id"
        class="bg-white/80 dark:bg-gray-900/80 shadow-md rounded-2xl px-5 py-4 transition-transform transform hover:scale-[1.01] border border-gray-200 dark:border-gray-700">
        <div class="flex justify-between items-center">
          <div class="flex flex-col">
            <div class="font-medium text-lg text-gray-800 dark:text-white">{{ game.name }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate"
              :title="playerMap[game.id]?.join(', ')">
              {{ formatDate(game.created_at) }}
              <span v-if="playerMap[game.id]">– {{ playerMap[game.id].join(', ') }}</span>
            </div>
          </div>
          <div class="flex gap-3 items-center">
            <router-link :to="`/scorecard/${game.id}`" class="button-primary text-sm">📋</router-link>
            <button @click="toggleDetails(game.id)"
              class="text-xl text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
              {{ expandedGameId === game.id ? '▾' : '▸' }}
            </button>
          </div>
        </div>

        <!-- Detailbereich -->
        <transition name="fade">
          <div v-if="expandedGameId === game.id"
            class="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300">
            <div class="mb-2">🕳️ {{ $t('ListGames-HolesPlayed') }}: {{ gameMeta[game.id]?.holes?.length || 0 }}</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
              <div v-for="player in gameMeta[game.id]?.players || []" :key="player.id" class="truncate"
                :title="player.name">
                {{ player.name }} – Ø {{ player.avg.toFixed(2) }} – Σ {{ player.total }}
              </div>
            </div>
          </div>
        </transition>
      </li>
    </ul>

    <div v-if="totalPages > 1" class="flex flex-row gap-3 mt-6">
      <button v-if="currentPage > 1" @click="prevPage" class="button-primary flex-1 text-center">
        {{ $t('Back') }}
      </button>
      <button v-if="currentPage < totalPages" @click="nextPage" class="button-primary flex-1 text-center">
        {{ $t('Forward') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

const games = ref([]);
const playerMap = ref({});
const gameMeta = ref({});
const searchTerm = ref('');
const expandedGameId = ref(null);
const currentPage = ref(1);
const perPage = 5;

onMounted(async () => {
  try {
    const { data } = await axios.get('/games');
    if (!Array.isArray(data)) {
      alert('API-Antwort ist kein Array');
      return;
    }

    games.value = data;

    for (const game of games.value) {
      const { data: players } = await axios.get(`/games/${game.id}/players`);
      playerMap.value[game.id] = players.map(p => p.name);
    }
  } catch (err) {
    console.error('Fehler beim Laden der Spiele:', err);
    alert('Fehler beim Laden der Spieldaten.');
  }
});

function toggleDetails(gameId) {
  if (expandedGameId.value === gameId) {
    expandedGameId.value = null;
    return;
  }

  expandedGameId.value = gameId;

  if (gameMeta.value[gameId]) return;

  loadMeta(gameId);
}

async function loadMeta(gameId) {
  try {
    const { data: scores } = await axios.get('/scores', {
      params: { game_id: gameId }
    });

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
  } catch (err) {
    console.error(`Fehler beim Laden der Metadaten für Spiel ${gameId}:`, err);
  }
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

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredGames.value.length / perPage))
);

watch(filteredGames, (filtered) => {
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  if (currentPage.value > pages) {
    currentPage.value = pages;
  }
});

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