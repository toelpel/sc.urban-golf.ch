<template>
  <div class="max-w-4xl mx-auto px-4">
    <h1 class="text-2xl font-bold mb-6 text-center">Alle Spiele</h1>

    <input
      type="text"
      v-model="searchTerm"
      placeholder="🔍 Spiel- oder Spielername"
      class="input-field w-full mb-4"
    />

    <div v-if="paginatedGames.length === 0" class="text-center text-gray-500">
      Keine Spiele gefunden.
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="game in paginatedGames"
        :key="game.id"
        class="bg-white shadow-sm rounded py-3 px-4 flex justify-between items-center hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
      >
        <div>
          <div class="font-semibold text-lg text-gray-800 dark:text-white">{{ game.name }}</div>
          <div class="text-sm text-gray-500">
            {{ formatDate(game.created_at) }}
            <span v-if="playerMap[game.id]">– {{ playerMap[game.id].join(', ') }}</span>
          </div>
        </div>
        <router-link
          :to="`/scorecard/${game.id}`"
          class="button-primary"
        >
          Öffnen →
        </router-link>
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
const searchTerm = ref('');
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

  // Spieler zuordnen
  for (const game of games.value) {
    const resPlayers = await fetch(`https://api.sc.urban-golf.ch/api/games/${game.id}/players`);
    const players = await resPlayers.json();
    playerMap.value[game.id] = players.map(p => p.name);
  }
});

const filteredGames = computed(() => {
  if (searchTerm.value.length < 3) return games.value;

  return games.value.filter(game => {
    const gameName = game.name.toLowerCase();
    const playerNames = (playerMap.value[game.id] || []).join(' ').toLowerCase();
    const term = searchTerm.value.toLowerCase();
    return gameName.includes(term) || playerNames.includes(term);
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
