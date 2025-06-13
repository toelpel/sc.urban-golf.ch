<template>
  <div class="max-w-3xl">
    <h1 class="text-2xl font-bold mb-4">Neues Spiel erstellen</h1>
    <div class="flex flex-col items-stretch gap-4 max-w-md mt-6">
      <input
        type="text"
        v-model="gameName"
        placeholder="Spielname"
        class="input-field w-full"
      />

      <div v-for="(name, index) in players" :key="index">
        <input
          type="text"
          v-model="players[index]"
          :placeholder="`Spieler ${index + 1}`"
          class="input-field w-full"
        />
      </div>

      <button
        @click="addPlayer"
        :disabled="players.length >= 10"
        class="button-primary w-full"
      >
        + Spieler hinzufügen
      </button>

      <button
        @click="createGame"
        class="button-primary w-full"
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

    router.push(`/hole/${game.id}/1`);
  } catch (err) {
    console.error('Fehler beim Erstellen des Spiels:', err);
    alert('Es gab ein Problem beim Erstellen des Spiels.');
  }
}
</script>