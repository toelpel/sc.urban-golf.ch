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

      <div v-for="(player, index) in players" :key="index">
        <input
          type="text"
          v-model="player.name"
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
const players = ref([{ id: null, name: '' }]);
const isEditing = ref(false);

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
    players.value = existing.map(p => ({ id: p.id, name: p.name }));
  }
});

function addPlayer() {
  if (players.value.length < 10) {
    players.value.push({ id: null, name: '' });
  }
}

async function saveGame() {
  const validPlayers = players.value.map(p => ({ ...p, name: p.name.trim() })).filter(p => p.name);
  if (!gameName.value || validPlayers.length === 0) {
    alert('Bitte Spielname und mindestens einen Spieler angeben.');
    return;
  }

  try {
    const playerIds = [];

    for (const player of validPlayers) {
      if (player.id) {
        await fetch(`https://api.sc.urban-golf.ch/api/players/${player.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: player.name })
        });
        playerIds.push(player.id);
      } else {
        const res = await fetch('https://api.sc.urban-golf.ch/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: player.name })
        });
        const newPlayer = await res.json();
        playerIds.push(newPlayer.id);
      }
    }

    if (isEditing.value) {
      await fetch(`https://api.sc.urban-golf.ch/api/games/${gameId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: gameName.value })
      });

      await fetch(`https://api.sc.urban-golf.ch/api/games/${gameId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: playerIds })
      });

      router.go(-1);
    } else {
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
    console.error(err);
    alert('Fehler beim Speichern: ' + err.message);
  }
}
</script>
