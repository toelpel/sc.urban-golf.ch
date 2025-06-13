<template>
  <div class="max-w-4xl mx-auto px-4">
    <h1 class="text-2xl font-bold mb-6 text-center">Alle Spiele</h1>

    <div v-if="games.length === 0" class="text-center text-gray-500">
      Keine Spiele gefunden.
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="game in games"
        :key="game.id"
        class="bg-white shadow-sm rounded px-4 py-3 flex justify-between items-center hover:bg-gray-50"
      >
        <div>
          <div class="font-semibold text-lg text-gray-800">{{ game.name }}</div>
          <div class="text-sm text-gray-500">{{ formatDate(game.created_at) }}</div>
        </div>
        <router-link
          :to="`/scorecard/${game.id}`"
          class="font-semibold hover:underline"
        >
          Öffnen →
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const games = ref([]);

onMounted(async () => {
  const res = await fetch('https://api.sc.urban-golf.ch/api/games');
  const data = await res.json();

  if (!Array.isArray(data)) {
    console.error('API-Antwort ist kein Array:', data);
    return;
  }

  games.value = data;
  console.log('Geladene Spiele:', games.value);
});

function formatDate(ts) {
  if (!ts) return 'unbekannt';
  return new Date(ts).toLocaleString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
</script>