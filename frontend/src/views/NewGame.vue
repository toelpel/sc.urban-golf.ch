<template>
  <div class="max-w-xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Neues Spiel erstellen</h1>

    <form @submit.prevent="createGame" class="space-y-4">
      <div>
        <label for="gameName" class="block mb-1 font-medium">Spielname</label>
        <input v-model="gameName" id="gameName" type="text" required
               class="w-full p-2 border border-gray-300 rounded" placeholder="z.B. Samstagsturnier" />
      </div>

      <div>
        <label for="players" class="block mb-1 font-medium">Spieler (max. 10)</label>
        <div v-for="(name, index) in playerNames" :key="index" class="flex items-center space-x-2 mb-2">
          <input v-model="playerNames[index]" type="text" class="flex-1 p-2 border border-gray-300 rounded" placeholder="Spielername" />
          <button type="button" @click="removePlayer(index)" class="text-red-600 hover:underline">Entfernen</button>
        </div>
        <button type="button" @click="addPlayer" class="text-blue-600 hover:underline" :disabled="playerNames.length >= 10">
          + Spieler hinzufügen
        </button>
      </div>

      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Spiel starten
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const gameName = ref('');
const playerNames = ref(['']);
const router = useRouter();

function addPlayer() {
  if (playerNames.value.length < 10) playerNames.value.push('');
}

function removePlayer(index) {
  playerNames.value.splice(index, 1);
}

async function createGame() {
  const playerIds = [];

  for (const name of playerNames.value.filter(n => n.trim() !== '')) {
    const res = await fetch('https://api.sc.urban-golf.ch/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    const player = await res.json();
    playerIds.push(player.id);
  }

  const resGame = await fetch('https://api.sc.urban-golf.ch/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: gameName.value,
      players: playerIds
    })
  });
  const game = await resGame.json();
  router.push(`/scorecard/${game.id}`);
}
</script>

<style scoped>
</style>