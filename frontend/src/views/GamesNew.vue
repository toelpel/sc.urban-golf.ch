<template>
  <DefaultTemplate>
    <h1 class="maintitle">
      {{ isEditing ? $t('Games.NewGame.TitleEdit') : $t('Games.NewGame.TitleNew') }}
    </h1>

    <div class="flex flex-col items-stretch gap-4 mt-6">
      <input type="text" v-model="gameName" :placeholder="$t('Games.NewGame.GameName')" maxlength="30"
        class="input-field w-full" />

      <div v-for="(player, index) in players" :key="player.id">
        <input type="text" v-model="player.name" :placeholder="`${$t('Games.NewGame.PlayerName')} ${index + 1}`"
          maxlength="30" class="input-field w-full" />
      </div>

      <button @click="addPlayer" :disabled="players.length >= 10" class="button-primary w-full">
        {{ $t('Games.NewGame.AddPlayer') }}
      </button>

      <button @click="saveGame" :disabled="isSaving" class="button-primary w-full">
        {{ isEditing ? $t('Games.NewGame.SaveChanges') : $t('Games.NewGame.StartGame') }}
      </button>
    </div>
  </DefaultTemplate>
</template>

<script setup>
import DefaultTemplate from '@/layouts/DefaultTemplate.vue'
import { ref, computed, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { nanoid } from 'nanoid'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const gameId = computed(() => route.params.gameId)

const gameName = ref('')
const players = ref([{ id: nanoid(), name: '' }])
const isEditing = computed(() => !!gameId.value)
const isSaving = ref(false)

// Hauptlogik zum Laden eines bestehenden Spiels
async function loadGame(id) {
  const { data: game } = await axios.get(`/games/${id}`)
  gameName.value = game?.name || ''

  const { data: existing } = await axios.get(`/games/${id}/players`)
  players.value = existing.map(p => ({ id: p.id, name: p.name }))
}

// Initiales Laden beim Mount
watchEffect(async () => {
  if (gameId.value) {
    await loadGame(gameId.value)
  }
})

function addPlayer() {
  if (players.value.length < 10) {
    players.value.push({ id: nanoid(), name: '' })
  }
}

async function saveGame() {
  if (isSaving.value) return
  isSaving.value = true

  const validPlayers = players.value
    .map(p => ({ ...p, name: p.name.trim() }))
    .filter(p => p.name)

  if (!gameName.value || validPlayers.length === 0) {
    alert('Please enter game name and at least one player.')
    isSaving.value = false
    return
  }

  try {
    const playerIds = []

    for (const player of validPlayers) {
      player.name = player.name.trim()
      await axios.post('/players', { id: player.id, name: player.name })
      playerIds.push(player.id)
    }

    // Upsert: Immer POST, ID wird je nach Modus gesetzt
    const idToUse = isEditing.value ? gameId.value : nanoid()
    const { data: game } = await axios.post('/games', {
      id: idToUse,
      name: gameName.value,
      players: playerIds,
    })

    if (!game?.id) {
      alert('Error when saving the game.')
      return
    }

    if (isEditing.value) {
      router.go(-1)
    } else {
      router.push(`/games/${game.id}/1`)
    }
  } catch (err) {
    console.error(err)
    alert('Error when saving: ' + err.message)
  } finally {
    isSaving.value = false
  }
}
</script>