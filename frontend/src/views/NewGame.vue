<template>
  <div class="max-w-3xl mx-auto px-4">
    <h1 class="text-2xl font-bold mb-4">Neues Spiel erstellen</h1>

    <div class="space-y-4">
      <input
        type="text"
        v-model="gameName"
        placeholder="Spielname"
        class="w-full p-2 border rounded"
      />

      <input
        type="number"
        v-model.number="initialHoleCount"
        min="0"
        placeholder="Anzahl Löcher (0 = manuell)"
        class="w-full p-2 border rounded"
      />

      <div v-for="(name, index) in players" :key="index">
        <input
          type="text"
          v-model="players[index]"
          :placeholder="`Spieler ${index + 1}`"
          class="w-full p-2 border rounded"
        />
      </div>

      <button
        @click="addPlayer"
        :disabled="players.length >= 10"
        class="bg-green-600 text-white px-4 py-2 rounded"
      >
        + Spieler hinzufügen
      </button>

      <button
        @click="createGame"
        class="bg-blue-600 text-white px-6 py-2 rounded block mt-6"
      >
        Spiel starten
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const gameName = ref('');
const initialHoleCount = ref(0);
const players = ref(['']);

function addPlayer() {
  if (players.value.length < 10) {
    players.value.push('');
  }
}

async function createGame() {
  const validNames = players.value.map(name => name.trim()).filter(Boolean);
  if (!gameName.value || validNames.length === 0) {
    alert('Bitte Spielname und mindestens einen Spieler angeben.');
    return;
  }

  try {
    const playerResponses = await Promise.all(
      validNames.map(name =>
        fetch('https://api.sc.urban-golf.ch/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name })
        }).then(res => res.json())
      )
    );

    const playerIds = playerResponses.map(p => p.id);

    const resGame = await fetch('https://api.sc.urban-golf.ch/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: gameName.value,
        players: playerIds
      })
    });

    const game = await resGame.json();
    if (!game?.id) {
      alert('Fehler beim Erstellen des Spiels.');
      return;
    }

    // Löcher vorbereiten, wenn gewünscht
    const holeCount = parseInt(initialHoleCount.value);
    if (holeCount > 0) {
      for (const playerId of playerIds) {
        for (let i = 1; i <= holeCount; i++) {
          await fetch('https://api.sc.urban-golf.ch/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              game_id: game.id,
              player_id: playerId,
              hole: i,
              strokes: ''
            })
          });
        }
      }
    }

    router.push(`/scorecard/${game.id}`);
  } catch (err) {
    console.error('Fehler beim Erstellen des Spiels:', err);
    alert('Es gab ein Problem beim Erstellen des Spiels.');
  }
}
</script>