<template>
  <div class="max-w-3xl mx-auto px-4">
    <h1 class="text-2xl font-bold mb-4 text-center">
      {{ isEditing ? 'Spiel bearbeiten' : 'Neues Spiel erstellen' }}
    </h1>

    <div class="flex flex-col items-stretch gap-4 max-w-md mt-6 mx-auto">
      <input
        type="text"
        v-model="gameName"
        placeholder="Spielname"
        maxlength="30"
        class="input-field w-full"
      />

      <div v-for="(name, index) in players" :key="index">
        <input
          type="text"
          v-model="players[index]"
          :placeholder="`Spieler ${index + 1}`"
          maxlength="30"
          class="input-field w-full"
        />
      </div>

      <button
        @click="addPlayer"
        :disabled="players.length >= 10"
        class="button-primary w-full"
      >
        ➕ Spieler hinzufügen
      </button>

      <button
        @click="saveGame"
        class="button-primary w-full"
      >
        {{ isEditing ? '💾 Änderungen speichern' : '🏁 Spiel starten' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const gameId = route.query.gameId;

const gameName = ref('');
const players = ref(['']);
const isEditing = ref(false);
const existingPlayers = ref([]);

onMounted(async () => {
  if (gameId) {
    isEditing.value = true;
    const resGame = await fetch(`https://api.sc.urban-golf.ch/api/games`);
    const games = await resGame.json();
    const match = games.find(g => g.id === parseInt(gameId));
    if (match) {
      gameName.value = match.name || '';
    }

    const resPlayers = await fetch(`https://api.sc.urban-golf.ch/api/games/${gameId}/players`);
    const existing = await resPlayers.json();
    existingPlayers.value = existing.map(p => p.name);
    players.value = [...existingPlayers.value];
  }
});

function addPlayer() {
  if (players.value.length < 10) {
    players.value.push('');
  }
}

async function saveGame() {
  const validNames = players.value.map(name => name.trim()).filter(Boolean);
  if (!gameName.value || validNames.length === 0) {
    alert('Bitte Spielname und mindestens einen Spieler angeben.');
    return;
  }

  try {
    if (isEditing.value) {
      // Nur neue Spieler speichern
      const newNames = validNames.filter(name => !existingPlayers.value.includes(name));
      const playerResponses = await Promise.all(
        newNames.map(name =>
          fetch('https://api.sc.urban-golf.ch/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
          }).then(res => res.json())
        )
      );

      const newPlayerIds = playerResponses.map(p => p.id);

      // Spielname aktualisieren
      await fetch(`https://api.sc.urban-golf.ch/api/games/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: gameName.value })
      });

      // Neue Spieler dem Spiel hinzufügen
      await fetch(`https://api.sc.urban-golf.ch/api/games/${gameId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: newPlayerIds })
      });

      router.go(-1); // zurück zur vorherigen Seite

    } else {
      // Neues Spiel erstellen
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
    }
  } catch (err) {
    alert('Es gab ein Problem beim Speichern des Spiels.');
  }
}
</script>
